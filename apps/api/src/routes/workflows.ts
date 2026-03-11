import { Router } from "express";
import { prisma } from "@aios/database";

export const workflowsRouter = Router();

workflowsRouter.get("/", async (_req, res) => {
  try {
    const workflows = await prisma.workflow.findMany({
      include: { nodes: true, edges: true },
      orderBy: { updatedAt: "desc" },
    });
    res.json({ data: workflows });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch workflows" });
  }
});

workflowsRouter.get("/:id", async (req, res) => {
  try {
    const workflow = await prisma.workflow.findUnique({
      where: { id: req.params.id },
      include: { nodes: true, edges: true, executions: { take: 10, orderBy: { startedAt: "desc" } } },
    });
    if (!workflow) { res.status(404).json({ error: "Workflow not found" }); return; }
    res.json({ data: workflow });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch workflow" });
  }
});

workflowsRouter.post("/", async (req, res) => {
  try {
    const { name, description, workspaceId, nodes, edges } = req.body;
    const workflow = await prisma.workflow.create({
      data: {
        name,
        description,
        workspaceId,
        nodes: { create: nodes || [] },
        edges: { create: edges || [] },
      },
      include: { nodes: true, edges: true },
    });
    res.status(201).json({ data: workflow });
  } catch (error) {
    res.status(500).json({ error: "Failed to create workflow" });
  }
});

// Trigger a workflow execution
workflowsRouter.post("/:id/execute", async (req, res) => {
  try {
    const workflow = await prisma.workflow.findUnique({
      where: { id: req.params.id },
    });
    if (!workflow) { res.status(404).json({ error: "Workflow not found" }); return; }

    const execution = await prisma.workflowExecution.create({
      data: {
        workflowId: workflow.id,
        status: "pending",
        startedAt: new Date(),
        triggerData: req.body.input || {},
      },
    });
    res.status(201).json({ data: execution });
  } catch (error) {
    res.status(500).json({ error: "Failed to execute workflow" });
  }
});

workflowsRouter.get("/:id/executions", async (req, res) => {
  try {
    const executions = await prisma.workflowExecution.findMany({
      where: { workflowId: req.params.id },
      include: { nodeExecs: true },
      orderBy: { startedAt: "desc" },
    });
    res.json({ data: executions });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch executions" });
  }
});
