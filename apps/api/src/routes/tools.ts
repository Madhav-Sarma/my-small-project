import { Router } from "express";
import { prisma } from "@aios/database";
import { createWalletMiddleware, type WalletRequest } from "@aios/auth";

export const toolsRouter = Router();

// Wallet middleware bound to the shared Prisma instance
const wallet = createWalletMiddleware(prisma);

// List all tools
toolsRouter.get("/", async (_req, res) => {
  try {
    const tools = await prisma.tool.findMany({
      where: { status: "published" },
      orderBy: { name: "asc" },
    });
    res.json({ data: tools });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tools" });
  }
});

// Get tool by ID
toolsRouter.get("/:id", async (req, res) => {
  try {
    const tool = await prisma.tool.findUnique({
      where: { id: req.params.id },
      include: { templates: true, versions: true },
    });
    if (!tool) { res.status(404).json({ error: "Tool not found" }); return; }
    res.json({ data: tool });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tool" });
  }
});

// Install tool to workspace
toolsRouter.post("/:id/install", async (req, res) => {
  try {
    const { workspaceId } = req.body;
    const installation = await prisma.toolInstallation.create({
      data: { toolId: req.params.id, workspaceId, configuration: {} },
    });
    res.status(201).json({ data: installation });
  } catch (error) {
    res.status(500).json({ error: "Failed to install tool" });
  }
});

// Execute tool — guarded by wallet credit check
toolsRouter.post(
  "/:id/execute",
  // Pre-flight: resolve tool pricing and check credits before queuing
  async (req: WalletRequest, res, next) => {
    try {
      const tool = await prisma.tool.findUnique({
        where: { id: req.params.id },
        select: { pricingCredits: true },
      });
      if (!tool) { res.status(404).json({ error: "Tool not found" }); return; }
      // Attach required credits to body so the wallet middleware resolver can read it
      (req as WalletRequest & { _requiredCredits: number })._requiredCredits = Number(tool.pricingCredits);
      next();
    } catch {
      res.status(500).json({ error: "Failed to resolve tool pricing" });
    }
  },
  wallet.checkCredits((req) => (req as WalletRequest & { _requiredCredits: number })._requiredCredits ?? 1),
  async (req: WalletRequest, res) => {
    try {
      const tool = await prisma.tool.findUnique({ where: { id: req.params.id } });
      if (!tool) { res.status(404).json({ error: "Tool not found" }); return; }

      const job = await prisma.toolExecutionJob.create({
        data: {
          toolId: tool.id,
          userId: req.walletContext?.userId ?? req.body.userId,
          workspaceId: req.body.workspaceId,
          organizationId: req.walletContext?.organizationId ?? req.body.organizationId,
          handlerType: tool.handlerType,
          model: req.body.model ?? tool.defaultModel,
          input: req.body.input,
          status: "queued",
        },
      });

      // Deduct credits immediately upon successful job creation
      if (req.walletContext) {
        await wallet.deductCredits(
          req.walletContext.organizationId,
          req.walletContext.userId,
          req.walletContext.requiredCredits,
          `Tool execution: ${tool.name}`,
          { toolId: tool.id, jobId: job.id },
        );
      }

      res.status(202).json({ data: { jobId: job.id, status: "queued" } });
    } catch (error) {
      res.status(500).json({ error: "Failed to execute tool" });
    }
  },
);

// Get execution job status
toolsRouter.get("/jobs/:jobId", async (req, res) => {
  try {
    const job = await prisma.toolExecutionJob.findUnique({
      where: { id: req.params.jobId },
    });
    if (!job) { res.status(404).json({ error: "Job not found" }); return; }
    res.json({ data: job });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch job" });
  }
});

// List all tools
toolsRouter.get("/", async (_req, res) => {
  try {
    const tools = await prisma.tool.findMany({
      where: { status: "published" },
      orderBy: { name: "asc" },
    });
    res.json({ data: tools });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tools" });
  }
});

// Get tool by ID
toolsRouter.get("/:id", async (req, res) => {
  try {
    const tool = await prisma.tool.findUnique({
      where: { id: req.params.id },
      include: { templates: true, versions: true },
    });
    if (!tool) { res.status(404).json({ error: "Tool not found" }); return; }
    res.json({ data: tool });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tool" });
  }
});

// Install tool to workspace
toolsRouter.post("/:id/install", async (req, res) => {
  try {
    const { workspaceId } = req.body;
    const installation = await prisma.toolInstallation.create({
      data: { toolId: req.params.id, workspaceId, configuration: {} },
    });
    res.status(201).json({ data: installation });
  } catch (error) {
    res.status(500).json({ error: "Failed to install tool" });
  }
});

// Execute tool
toolsRouter.post("/:id/execute", async (req, res) => {
  try {
    const tool = await prisma.tool.findUnique({ where: { id: req.params.id } });
    if (!tool) { res.status(404).json({ error: "Tool not found" }); return; }

    // Create execution job
    const job = await prisma.toolExecutionJob.create({
      data: {
        toolId: tool.id,
        userId: req.body.userId,
        workspaceId: req.body.workspaceId,
        organizationId: req.body.organizationId,
        handlerType: tool.handlerType,
        model: req.body.model ?? tool.defaultModel,
        input: req.body.input,
        status: "queued",
      },
    });

    res.status(202).json({ data: { jobId: job.id, status: "queued" } });
  } catch (error) {
    res.status(500).json({ error: "Failed to execute tool" });
  }
});

// Get execution job status
toolsRouter.get("/jobs/:jobId", async (req, res) => {
  try {
    const job = await prisma.toolExecutionJob.findUnique({
      where: { id: req.params.jobId },
    });
    if (!job) { res.status(404).json({ error: "Job not found" }); return; }
    res.json({ data: job });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch job" });
  }
});
