import express from "express";
import helmet from "helmet";
import cors from "cors";
import { Worker } from "bullmq";
import { prisma } from "@aios/database";
import { WorkflowGraph } from "@aios/workflow-core";

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

const PORT = process.env.WORKFLOW_ENGINE_PORT || 4300;
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const redis = new URL(REDIS_URL);
const connection = {
  host: redis.hostname,
  port: Number(redis.port || 6379),
};

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "workflow-engine" });
});

// Workflow execution worker
const workflowWorker = new Worker(
  "workflow-execution",
  async (job) => {
    const { executionId } = job.data;

    const execution = await prisma.workflowExecution.findUnique({
      where: { id: executionId },
      include: {
        workflow: { include: { nodes: true, edges: true } },
      },
    });

    if (!execution) throw new Error(`Execution ${executionId} not found`);

    await prisma.workflowExecution.update({
      where: { id: executionId },
      data: { status: "running" },
    });

    const { workflow } = execution;

    // Build the graph from DB nodes & edges
    const graph = new WorkflowGraph({
      id: workflow.id,
      name: workflow.name,
      triggerType: "manual",
      nodes: workflow.nodes.map((n) => ({
        id: n.id,
        type: n.nodeType as any,
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
    });

    const sortedNodes = graph.topologicalSort();

    // Execute nodes in order
    for (const nodeId of sortedNodes) {
      const node = workflow.nodes.find((n) => n.id === nodeId);
      if (!node) continue;

      await prisma.workflowNodeExecution.create({
        data: {
          executionId,
          nodeId: node.id,
          status: "running",
          startedAt: new Date(),
        },
      });

      // Placeholder: actual node execution logic would be dispatched here
      await prisma.workflowNodeExecution.updateMany({
        where: { executionId, nodeId: node.id, status: "running" },
        data: {
          status: "completed",
          completedAt: new Date(),
          output: { result: `Node ${node.nodeType} executed` },
        },
      });
    }

    await prisma.workflowExecution.update({
      where: { id: executionId },
      data: { status: "completed", completedAt: new Date() },
    });

    return { success: true, executionId };
  },
  { connection }
);

workflowWorker.on("completed", (job) => {
  console.log(`Workflow job ${job.id} completed`);
});

workflowWorker.on("failed", (job, err) => {
  console.error(`Workflow job ${job?.id} failed:`, err.message);
});

app.listen(PORT, () => {
  console.log(`Workflow Engine running on port ${PORT}`);
});
