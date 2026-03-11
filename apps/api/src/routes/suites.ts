import { Router } from "express";
import { prisma } from "@aios/database";

export const suitesRouter = Router();

suitesRouter.get("/", async (_req, res) => {
  try {
    const suites = await prisma.suite.findMany({
      where: { status: "published" },
      include: { tools: { include: { tool: true } } },
      orderBy: { name: "asc" },
    });
    res.json({ data: suites });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch suites" });
  }
});

suitesRouter.get("/:id", async (req, res) => {
  try {
    const suite = await prisma.suite.findUnique({
      where: { id: req.params.id },
      include: { tools: { include: { tool: true } }, pricingTiers: true },
    });
    if (!suite) { res.status(404).json({ error: "Suite not found" }); return; }
    res.json({ data: suite });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch suite" });
  }
});

suitesRouter.post("/:id/install", async (req, res) => {
  try {
    const { workspaceId } = req.body;
    const installation = await prisma.suiteInstallation.create({
      data: { suiteId: req.params.id, workspaceId },
    });
    res.status(201).json({ data: installation });
  } catch (error) {
    res.status(500).json({ error: "Failed to install suite" });
  }
});

// Custom suite builder
suitesRouter.post("/custom", async (req, res) => {
  try {
    const { name, toolIds, createdById } = req.body;
    const suite = await prisma.suite.create({
      data: {
        slug: name.toLowerCase().replace(/\s+/g, "-"),
        name,
        isCustom: true,
        createdById,
        tools: {
          create: toolIds.map((toolId: string, idx: number) => ({
            toolId,
            order: idx,
          })),
        },
      },
      include: { tools: { include: { tool: true } } },
    });
    res.status(201).json({ data: suite });
  } catch (error) {
    res.status(500).json({ error: "Failed to create custom suite" });
  }
});
