import express from "express";
import helmet from "helmet";
import cors from "cors";
import { Worker } from "bullmq";
import { prisma } from "@aios/database";
import { AgentRuntime, type AIGatewayClient, type AgentMessage } from "@aios/agent-core";
import { ToolRuntimeEngine, OutputRouter, createDefaultRegistry, type ToolConfig } from "@aios/tool-runtime";
import { CreditWalletService } from "@aios/credits";

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

const PORT = process.env.AGENT_RUNNER_PORT || 4200;
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const AI_GATEWAY_URL = process.env.AI_GATEWAY_URL ?? "http://localhost:4100";

const redis = new URL(REDIS_URL);
const connection = {
  host: redis.hostname,
  port: Number(redis.port || 6379),
};

// --- Runtime infrastructure (shared across all worker jobs) ---

const handlerRegistry = createDefaultRegistry(AI_GATEWAY_URL);
const outputRouter = new OutputRouter();
const toolEngine = new ToolRuntimeEngine(handlerRegistry, outputRouter);
const walletService = new CreditWalletService();

/**
 * HTTP implementation of AIGatewayClient that calls the AIOS AI Gateway service.
 * Uses the same `/v1/chat/completions` contract as the OpenAI-compatible gateway.
 */
class HttpAIGatewayClient implements AIGatewayClient {
  constructor(private readonly gatewayUrl: string) {}

  async chat(params: { model: string; messages: AgentMessage[]; tools?: string[] }) {
    const response = await fetch(`${this.gatewayUrl}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: params.model,
        messages: params.messages.map((m) => ({ role: m.role, content: m.content })),
      }),
    });

    if (!response.ok) {
      throw new Error(`AI Gateway responded with ${response.status}: ${response.statusText}`);
    }

    const data = (await response.json()) as {
      choices: Array<{ message: { content: string } }>;
      usage?: { total_tokens?: number };
    };

    return {
      content: data.choices[0]?.message?.content ?? "",
      tokensUsed: data.usage?.total_tokens ?? 0,
    };
  }
}

const aiGatewayClient = new HttpAIGatewayClient(AI_GATEWAY_URL);

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "agent-runner" });
});

// Agent execution worker
const agentWorker = new Worker(
  "agent-execution",
  async (job) => {
    const { agentId, input, workspaceId, organizationId, userId, creditsAvailable } = job.data as {
      agentId: string;
      input: string;
      workspaceId: string;
      organizationId?: string;
      userId?: string;
      creditsAvailable?: number;
    };

    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      include: { tools: { include: { tool: true } } },
    });

    if (!agent) throw new Error(`Agent ${agentId} not found`);

    // Credit pre-flight: estimate cost (base + max tool iterations)
    const estimatedCredits =
      agent.tools.reduce((sum, at) => sum + Number(at.tool.pricingCredits), 0) *
      agent.maxIterations;

    if (organizationId && estimatedCredits > 0) {
      const walletBalance = await walletService.getBalance(organizationId);
      if (walletBalance < estimatedCredits) {
        throw new Error(
          `Insufficient credits for agent "${agent.name}": requires ~${estimatedCredits}, available ${walletBalance}`,
        );
      }
    }

    const executionLog = await prisma.agentExecutionLog.create({
      data: {
        agentId,
        workspaceId,
        input,
        output: null,
        status: "running",
        startedAt: new Date(),
      },
    });

    // Build a DB-backed tool config resolver so the agent can invoke installed tools
    const toolConfigResolver = async (toolId: string): Promise<ToolConfig | null> => {
      const tool = await prisma.tool.findUnique({ where: { id: toolId } });
      if (!tool) return null;
      return {
        toolId: tool.id,
        name: tool.name,
        handlerType: tool.handlerType as ToolConfig["handlerType"],
        defaultModel: tool.defaultModel ?? "gpt-4o",
        inputSchema: (tool.inputSchema as Record<string, unknown>) ?? {},
        outputType: tool.outputType as ToolConfig["outputType"],
        promptTemplate: tool.promptTemplate ?? undefined,
        pricingCredits: Number(tool.pricingCredits),
        apiProvider: undefined,
      };
    };

    const runtime = new AgentRuntime(toolEngine, aiGatewayClient, toolConfigResolver);

    const context = {
      userId: userId ?? "system",
      workspaceId,
      organizationId: organizationId ?? "",
      creditsAvailable: creditsAvailable ?? (organizationId ? await walletService.getBalance(organizationId) : 9999),
    };

    const agentConfig = {
      agentId: agent.id,
      name: agent.name,
      goal: agent.goal ?? "",
      systemPrompt: agent.systemPrompt ?? "",
      model: agent.model,
      maxIterations: agent.maxIterations,
      memoryEnabled: true,
      toolIds: agent.tools.map((t) => t.tool.id),
    };

    const result = await runtime.run(agentConfig, input, context);

    await prisma.agentExecutionLog.update({
      where: { id: executionLog.id },
      data: {
        output: JSON.stringify(result),
        status: result.success ? "completed" : "failed",
        completedAt: new Date(),
        tokensUsed: result.tokensUsed,
      },
    });

    // Deduct actual credits based on tokens used
    if (organizationId && result.tokensUsed > 0) {
      // Rough conversion: 1 credit per 1000 tokens (configurable)
      const creditsToDeduct = Math.max(1, Math.ceil(result.tokensUsed / 1000));
      await walletService.deduct({
        organizationId,
        userId,
        amount: creditsToDeduct,
        description: `Agent run: ${agent.name} (${result.tokensUsed} tokens)`,
        referenceType: "agent_run",
        referenceId: agentId,
        metadata: { jobId: job.id, workspaceId, iterations: result.iterations },
      }).catch((err: Error) => {
        // Log but do not fail the job — the work was already done
        console.error(`[AgentRunner] Credit deduction failed for job ${job.id}:`, err.message);
      });
    }

    return result;
  },
  { connection },
);

agentWorker.on("completed", (job) => {
  console.log(`[AgentRunner] Job ${job.id} completed`);
});

agentWorker.on("failed", (job, err) => {
  console.error(`[AgentRunner] Job ${job?.id} failed:`, err.message);
});

app.listen(PORT, () => {
  console.log(`[AgentRunner] Running on port ${PORT}`);
});
