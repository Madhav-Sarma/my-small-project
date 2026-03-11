import { Router } from "express";
import { prisma } from "@aios/database";

export const workspacesRouter = Router();

workspacesRouter.get("/", async (req, res) => {
  try {
    const orgId = req.query.organizationId as string;
    const workspaces = await prisma.workspace.findMany({
      where: { organizationId: orgId },
      orderBy: { updatedAt: "desc" },
    });
    res.json({ data: workspaces });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch workspaces" });
  }
});

workspacesRouter.get("/:id", async (req, res) => {
  try {
    const workspace = await prisma.workspace.findUnique({
      where: { id: req.params.id },
      include: {
        toolInstallations: { include: { tool: true } },
        suiteInstallations: { include: { suite: true } },
        packInstallations: { include: { pack: true } },
        appInstallations: { include: { app: true } },
        documents: { orderBy: { updatedAt: "desc" }, take: 20 },
      },
    });
    if (!workspace) { res.status(404).json({ error: "Workspace not found" }); return; }
    res.json({ data: workspace });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch workspace" });
  }
});

workspacesRouter.post("/", async (req, res) => {
  try {
    const { name, organizationId, createdById } = req.body;
    const workspace = await prisma.workspace.create({
      data: {
        name,
        slug: name.toLowerCase().replace(/\s+/g, "-"),
        organizationId,
        createdById,
      },
    });
    res.status(201).json({ data: workspace });
  } catch (error) {
    res.status(500).json({ error: "Failed to create workspace" });
  }
});
