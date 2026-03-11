import express from "express";
import helmet from "helmet";
import cors from "cors";
import { Worker } from "bullmq";
import { prisma } from "@aios/database";

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

const PORT = process.env.AGENT_RUNNER_PORT || 4200;
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const redis = new URL(REDIS_URL);
const connection = {
  host: redis.hostname,
  port: Number(redis.port || 6379),
};

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "agent-runner" });
});

// Agent execution worker
const agentWorker = new Worker(
  "agent-execution",
  async (job) => {
    const { agentId, input, workspaceId } = job.data;

    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      include: { tools: { include: { tool: true } } },
    });

    if (!agent) throw new Error(`Agent ${agentId} not found`);

    await prisma.agentExecutionLog.create({
      data: {
        agentId,
        workspaceId,
        input,
        output: null,
        status: "running",
        startedAt: new Date(),
      },
    });

    // Placeholder: actual agent runtime execution would go here
    // using AgentRuntime from @aios/agent-core
    const result = {
      success: true,
      agentId,
      output: `Agent ${agent.name} completed execution`,
      steps: [],
    };

    await prisma.agentExecutionLog.updateMany({
      where: { agentId, status: "running" },
      data: {
        output: JSON.stringify(result),
        status: "completed",
        completedAt: new Date(),
      },
    });

    return result;
  },
  { connection }
);

agentWorker.on("completed", (job) => {
  console.log(`Agent job ${job.id} completed`);
});

agentWorker.on("failed", (job, err) => {
  console.error(`Agent job ${job?.id} failed:`, err.message);
});

app.listen(PORT, () => {
  console.log(`Agent Runner running on port ${PORT}`);
});
