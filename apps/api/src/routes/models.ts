import { Router } from "express";
import { prisma } from "@aios/database";

export const modelsRouter = Router();

/**
 * GET /models
 * List all enabled AI models
 * Response: { data: AIModel[] }
 */
modelsRouter.get("/", async (_req, res) => {
  try {
    const models = await prisma.aIModel.findMany({
      where: { enabled: true, deprecated: false },
      select: {
        id: true,
        provider: true,
        modelName: true,
        displayName: true,
        category: true,
        description: true,
        contextWindow: true,
        maxOutputTokens: true,
        inputCostPer1kTokens: true,
        outputCostPer1kTokens: true,
      },
      orderBy: [{ category: "asc" }, { displayName: "asc" }],
    });

    res.json({ data: models });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch models" });
  }
});

/**
 * GET /models/:id
 * Get a specific AI model by ID
 */
modelsRouter.get("/:id", async (req, res) => {
  try {
    const model = await prisma.aIModel.findUnique({
      where: { id: req.params.id },
    });

    if (!model) {
      res.status(404).json({ error: "Model not found" });
      return;
    }

    res.json({ data: model });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch model" });
  }
});

/**
 * GET /models/provider/:provider
 * Get all models from a specific provider
 */
modelsRouter.get("/provider/:provider", async (req, res) => {
  try {
    const models = await prisma.aIModel.findMany({
      where: {
        provider: req.params.provider,
        enabled: true,
        deprecated: false,
      },
      orderBy: { displayName: "asc" },
    });

    res.json({ data: models });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch models" });
  }
});

/**
 * GET /models/category/:category
 * Get all models in a specific category (text, image, video, code, embedding)
 */
modelsRouter.get("/category/:category", async (req, res) => {
  try {
    const models = await prisma.aIModel.findMany({
      where: {
        category: req.params.category,
        enabled: true,
        deprecated: false,
      },
      orderBy: [{ provider: "asc" }, { displayName: "asc" }],
    });

    res.json({ data: models });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch models" });
  }
});
