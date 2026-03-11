import { Router } from "express";
import { prisma } from "@aios/database";

export const agentsRouter = Router();

agentsRouter.get("/", async (_req, res) => {
  try {
    const agents = await prisma.agent.findMany({
      include: { tools: { include: { tool: true } } },
      orderBy: { name: "asc" },
    });
    res.json({ data: agents });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch agents" });
  }
});

agentsRouter.get("/:id", async (req, res) => {
  try {
    const agent = await prisma.agent.findUnique({
      where: { id: req.params.id },
      include: { tools: { include: { tool: true } }, memory: true },
    });
    if (!agent) { res.status(404).json({ error: "Agent not found" }); return; }
    res.json({ data: agent });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch agent" });
  }
});

// Agent packs
agentsRouter.get("/packs/all", async (_req, res) => {
  try {
    const packs = await prisma.agentPack.findMany({
      include: { agents: { include: { agent: true } }, tools: { include: { tool: true } } },
    });
    res.json({ data: packs });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch agent packs" });
  }
});

agentsRouter.post("/packs/:id/install", async (req, res) => {
  try {
    const installation = await prisma.agentPackInstallation.create({
      data: { packId: req.params.id, workspaceId: req.body.workspaceId },
    });
    res.status(201).json({ data: installation });
  } catch (error) {
    res.status(500).json({ error: "Failed to install agent pack" });
  }
});
