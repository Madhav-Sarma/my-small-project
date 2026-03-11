import { Router } from "express";
import { prisma } from "@aios/database";
import { createWalletMiddleware, type WalletRequest, type AuthenticatedRequest } from "@aios/auth";
import { CreditWalletService } from "@aios/credits";
import {
  ToolRuntimeEngine,
  OutputRouter,
  createDefaultRegistry,
  type ToolConfig,
  type ToolInput,
  type ExecutionContext,
  type HandlerType,
  type OutputType,
} from "@aios/tool-runtime";

export const toolsRouter = Router();

// Wallet middleware bound to the shared Prisma instance
const wallet = createWalletMiddleware(prisma);
const creditWallet = new CreditWalletService();

// Singleton runtime engine — instantiated once per process
let _engine: ToolRuntimeEngine | null = null;
function getEngine(): ToolRuntimeEngine {
  if (!_engine) {
    const registry = createDefaultRegistry();
    const router = new OutputRouter();
    _engine = new ToolRuntimeEngine(registry, router);
  }
  return _engine;
}

// POST /tools/run — synchronous tool execution with model support
toolsRouter.post("/run", async (req: AuthenticatedRequest, res) => {
  try {
    const { toolId, modelId, inputs } = req.body as {
      toolId?: string;
      modelId?: string;
      inputs?: Record<string, unknown>;
    };

    if (!toolId || typeof toolId !== "string") {
      res.status(400).json({ error: "toolId is required" });
      return;
    }

    if (!modelId || typeof modelId !== "string") {
      res.status(400).json({ error: "modelId is required" });
      return;
    }

    // Resolve tool config from database
    const dbTool = await prisma.tool.findFirst({
      where: { OR: [{ id: toolId }, { slug: toolId }] },
    }).catch(() => null);

    if (!dbTool) {
      res.status(404).json({ error: `Tool not found: ${toolId}` });
      return;
    }

    // Validate model exists and is enabled
    const aiModel = await prisma.aIModel.findFirst({
      where: { OR: [{ id: modelId }, { modelName: modelId }], enabled: true },
    }).catch(() => null);

    if (!aiModel) {
      res.status(404).json({ error: `Model not found or disabled: ${modelId}` });
      return;
    }

    const config: ToolConfig = {
      toolId: dbTool.id,
      name: dbTool.name,
      handlerType: dbTool.handlerType as HandlerType,
      modelId: aiModel.id,
      inputSchema: dbTool.inputSchema as Record<string, unknown>,
      outputType: dbTool.outputType as OutputType,
      promptTemplate: dbTool.promptTemplate ?? undefined,
      pricingCredits: Number(dbTool.pricingCredits),
      apiProvider: dbTool.apiProvider ?? aiModel.provider,
    };

    const toolInput: ToolInput = {
      parameters: inputs ?? {},
      model: aiModel.modelName,
    };

    const context: ExecutionContext = {
      userId: req.userId ?? "anonymous",
      workspaceId: (req.body as Record<string, unknown>).workspaceId as string ?? "default",
      organizationId: req.organizationId ?? "default",
      creditsAvailable: await creditWallet.getBalance(req.organizationId ?? "default"),
    };

    // Pre-flight credit check
    if (context.creditsAvailable < config.pricingCredits) {
      res.status(402).json({ error: "Insufficient credits", required: config.pricingCredits, available: context.creditsAvailable });
      return;
    }

    const result = await getEngine().execute(config, toolInput, context);

    if (!result.success) {
      res.status(422).json({ error: result.error, jobId: result.jobId });
      return;
    }

    // Log the execution and deduct credits
    await Promise.all([
      prisma.toolRunRecord.create({
        data: {
          toolId: dbTool.id,
          modelId: aiModel.id,
          organizationId: context.organizationId,
          userId: context.userId !== "anonymous" ? context.userId : null,
          workspaceId: context.workspaceId !== "default" ? context.workspaceId : null,
          status: "completed",
          input: toolInput.parameters as any,
          output: result.output as any,
          creditsCharged: result.creditsCharged,
        },
      }).catch(() => null),
      creditWallet.deduct({
        organizationId: context.organizationId,
        userId: context.userId !== "anonymous" ? context.userId : undefined,
        amount: result.creditsCharged,
        description: `Tool run: ${dbTool.name} with ${aiModel.displayName}`,
        referenceType: "tool_run",
        referenceId: dbTool.id,
      }).catch(() => null),
    ]);

    res.json({ data: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Tool execution failed";
    res.status(500).json({ error: message });
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
          model: req.body.model ?? "gpt-4o",
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
