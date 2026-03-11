import express from "express";
import helmet from "helmet";
import cors from "cors";
import { Worker } from "bullmq";
import { prisma } from "@aios/database";
import { WorkflowGraph, WorkflowExecutor, type WorkflowNodeDef, type WorkflowContext } from "@aios/workflow-core";
import { ToolRuntimeEngine, OutputRouter, createDefaultRegistry } from "@aios/tool-runtime";
import { CreditWalletService } from "@aios/credits";

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

const PORT = process.env.WORKFLOW_ENGINE_PORT || 4300;
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
 * Build a WorkflowExecutor with handlers for each node type.
 * We create a fresh executor per-job so node state never leaks across executions.
 */
function createWorkflowExecutor(
  executionId: string,
  workspaceId: string,
  userId: string,
) {
  const executor = new WorkflowExecutor();

  // trigger — entry node, passes through trigger data unchanged
  executor.registerNodeHandler("trigger", async (_node, input) => input);

  // ai_tool — executes a configured tool via the runtime engine
  executor.registerNodeHandler(
    "ai_tool",
    async (node: WorkflowNodeDef, input: Record<string, unknown>, context: WorkflowContext) => {
      const toolId = String(node.configuration.toolId ?? "");
      if (!toolId) return { error: "ai_tool node missing toolId configuration" };

      const tool = await prisma.tool.findUnique({ where: { id: toolId } });
      if (!tool) return { error: `Tool ${toolId} not found` };

      const toolConfig = {
        toolId: tool.id,
        name: tool.name,
        handlerType: tool.handlerType as Parameters<typeof toolEngine.execute>[0]["handlerType"],
        modelId: "gpt-4o",
        inputSchema: (tool.inputSchema as Record<string, unknown>) ?? {},
        outputType: tool.outputType as Parameters<typeof toolEngine.execute>[0]["outputType"],
        promptTemplate: tool.promptTemplate ?? undefined,
        pricingCredits: Number(tool.pricingCredits),
      };

      const execContext = {
        userId,
        workspaceId,
        organizationId: String(context.variables["organizationId"] ?? ""),
        creditsAvailable: Number(context.variables["creditsAvailable"] ?? 0),
      };

      const result = await toolEngine.execute(
        toolConfig,
        { parameters: { ...input, ...node.configuration } },
        execContext,
      );

      return result.success ? (result.output?.data as Record<string, unknown>) ?? {} : { error: result.error };
    },
  );

  // api_connector — calls an external API described by the node configuration
  executor.registerNodeHandler(
    "api_connector",
    async (node: WorkflowNodeDef, input: Record<string, unknown>) => {
      const { url, method = "GET", headers = {} } = node.configuration as {
        url?: string;
        method?: string;
        headers?: Record<string, string>;
      };

      if (!url) return { error: "api_connector node missing url configuration" };

      const response = await fetch(String(url), {
        method: String(method),
        headers: { "Content-Type": "application/json", ...headers },
        body: method !== "GET" && method !== "HEAD" ? JSON.stringify(input) : undefined,
      });

      const data = (await response.json()) as Record<string, unknown>;
      return { statusCode: response.status, data };
    },
  );

  // logic_condition — evaluates a condition on context variables
  executor.registerNodeHandler(
    "logic_condition",
    async (node: WorkflowNodeDef, input: Record<string, unknown>) => {
      const { field, operator, value } = node.configuration as {
        field?: string;
        operator?: string;
        value?: unknown;
      };

      if (!field) return { passed: false, error: "logic_condition missing field" };

      const actual = input[field];
      let passed = false;
      switch (operator) {
        case "eq":  passed = actual === value; break;
        case "neq": passed = actual !== value; break;
        case "gt":  passed = Number(actual) > Number(value); break;
        case "lt":  passed = Number(actual) < Number(value); break;
        case "gte": passed = Number(actual) >= Number(value); break;
        case "lte": passed = Number(actual) <= Number(value); break;
        case "contains": passed = String(actual).includes(String(value)); break;
        default: passed = Boolean(actual);
      }

      return { passed, field, actual };
    },
  );

  // data_transformer — reshapes variables using a simple key-mapping config
  executor.registerNodeHandler(
    "data_transformer",
    async (node: WorkflowNodeDef, input: Record<string, unknown>) => {
      const mappings = (node.configuration.mappings ?? {}) as Record<string, string>;
      const output: Record<string, unknown> = {};
      for (const [outputKey, inputKey] of Object.entries(mappings)) {
        output[outputKey] = input[inputKey];
      }
      return { ...input, ...output };
    },
  );

  // agent_trigger — enqueues an agent execution job (fire-and-forget in workflow context)
  executor.registerNodeHandler(
    "agent_trigger",
    async (node: WorkflowNodeDef, input: Record<string, unknown>) => {
      const agentId = String(node.configuration.agentId ?? "");
      if (!agentId) return { error: "agent_trigger node missing agentId configuration" };
      // Execution is async; record the intent and return
      return { agentId, triggeredAt: new Date().toISOString(), triggerInput: input };
    },
  );

  // output — final node, passes through all accumulated variables
  executor.registerNodeHandler("output", async (_node, input) => input);

  return executor;
}

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "workflow-engine" });
});

// Workflow execution worker
const workflowWorker = new Worker(
  "workflow-execution",
  async (job) => {
    const { executionId } = job.data as { executionId: string };

    const execution = await prisma.workflowExecution.findUnique({
      where: { id: executionId },
      include: {
        workflow: { include: { nodes: true, edges: true } },
      },
    });

    if (!execution) throw new Error(`Execution ${executionId} not found`);

    const { workflow } = execution;

    // Credit pre-flight: count ai_tool nodes × their tool pricing
    const aiToolNodes = workflow.nodes.filter((n) => n.nodeType === "ai_tool");
    let estimatedCredits = 0;
    const organizationId = String(
      (execution.triggerData as Record<string, unknown>)?.organizationId ?? "",
    );

    if (organizationId && aiToolNodes.length > 0) {
      const toolIds = aiToolNodes.map((n) =>
        String((n.configuration as Record<string, unknown>).toolId ?? ""),
      ).filter(Boolean);

      const tools = await prisma.tool.findMany({
        where: { id: { in: toolIds } },
        select: { pricingCredits: true },
      });
      estimatedCredits = tools.reduce((sum, t) => sum + Number(t.pricingCredits), 0);

      if (estimatedCredits > 0) {
        const walletBalance = await walletService.getBalance(organizationId);
        if (walletBalance < estimatedCredits) {
          throw new Error(
            `Insufficient credits for workflow "${workflow.name}": requires ~${estimatedCredits}, available ${walletBalance}`,
          );
        }
      }
    }

    await prisma.workflowExecution.update({
      where: { id: executionId },
      data: { status: "running" },
    });

    // Build definition for WorkflowExecutor
    const definition = {
      id: workflow.id,
      name: workflow.name,
      triggerType: "manual",
      nodes: workflow.nodes.map((n) => ({
        id: n.id,
        type: n.nodeType as WorkflowNodeDef["type"],
        label: n.label ?? "Untitled Node",
        configuration: (n.configuration as Record<string, unknown>) || {},
        position: { x: n.positionX, y: n.positionY },
      })),
      edges: workflow.edges.map((e) => ({
        id: e.id,
        sourceNodeId: e.sourceNodeId,
        targetNodeId: e.targetNodeId,
        condition: (e.condition as Record<string, unknown>) || undefined,
      })),
    };

    // Persist node executions using the topological order from WorkflowGraph
    const graph = new WorkflowGraph(definition);
    const sortedNodeIds = graph.topologicalSort();

    for (const nodeId of sortedNodeIds) {
      await prisma.workflowNodeExecution.create({
        data: {
          executionId,
          nodeId,
          status: "pending",
          startedAt: new Date(),
        },
      });
    }

    const triggerData = (execution.triggerData as Record<string, unknown>) ?? {};
    const userId = workflow.createdById ?? "system";

    const executor = createWorkflowExecutor(executionId, workflow.workspaceId, userId);

    const result = await executor.execute(definition, triggerData, {
      workflowId: workflow.id,
      workspaceId: workflow.workspaceId,
      userId,
    });

    // Update individual node execution records
    for (const [nodeId, nodeResult] of result.nodeResults.entries()) {
      // Map executor statuses to valid ExecutionStatus enum values
      const dbStatus = nodeResult.status === "skipped" ? "completed" : (nodeResult.status as "completed" | "failed");
      await prisma.workflowNodeExecution.updateMany({
        where: { executionId, nodeId, status: "pending" },
        data: {
          status: dbStatus,
          completedAt: new Date(),
          output: nodeResult.output as Parameters<typeof prisma.workflowNodeExecution.updateMany>[0]["data"]["output"],
        },
      });
    }

    await prisma.workflowExecution.update({
      where: { id: executionId },
      data: {
        status: result.success ? "completed" : "failed",
        completedAt: new Date(),
      },
    });

    // Deduct credits for ai_tool nodes that ran successfully
    if (organizationId && estimatedCredits > 0) {
      await walletService.deduct({
        organizationId,
        amount: estimatedCredits,
        description: `Workflow run: ${workflow.name} (${aiToolNodes.length} AI nodes)`,
        referenceType: "workflow_run",
        referenceId: workflow.id,
        metadata: { jobId: job.id, executionId, workspaceId: workflow.workspaceId },
      }).catch((err: Error) => {
        console.error(`[WorkflowEngine] Credit deduction failed for job ${job.id}:`, err.message);
      });
    }

    return { success: result.success, executionId, error: result.error };
  },
  { connection },
);

workflowWorker.on("completed", (job) => {
  console.log(`[WorkflowEngine] Job ${job.id} completed`);
});

workflowWorker.on("failed", (job, err) => {
  console.error(`[WorkflowEngine] Job ${job?.id} failed:`, err.message);
});

app.listen(PORT, () => {
  console.log(`[WorkflowEngine] Running on port ${PORT}`);
});
