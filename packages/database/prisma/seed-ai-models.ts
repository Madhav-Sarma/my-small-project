import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedAIModels() {
  console.log("🌱 Seeding AI Models...");

  // OpenAI Models
  const openaiModels = [
    {
      provider: "openai",
      modelName: "gpt-4o",
      displayName: "GPT-4o",
      category: "text",
      description: "Most capable model, best for complex reasoning",
      contextWindow: 128000,
      maxOutputTokens: 4096,
      inputCostPer1kTokens: 0.005,
      outputCostPer1kTokens: 0.015,
    },
    {
      provider: "openai",
      modelName: "gpt-4o-mini",
      displayName: "GPT-4o Mini",
      category: "text",
      description: "Fast and efficient model for general tasks",
      contextWindow: 128000,
      maxOutputTokens: 4096,
      inputCostPer1kTokens: 0.00015,
      outputCostPer1kTokens: 0.0006,
    },
    {
      provider: "openai",
      modelName: "gpt-4-turbo",
      displayName: "GPT-4 Turbo",
      category: "text",
      description: "Advanced reasoning model with large context",
      contextWindow: 128000,
      maxOutputTokens: 4096,
      inputCostPer1kTokens: 0.01,
      outputCostPer1kTokens: 0.03,
    },
    {
      provider: "openai",
      modelName: "gpt-3.5-turbo",
      displayName: "GPT-3.5 Turbo",
      category: "text",
      description: "Cost-effective model for most tasks",
      contextWindow: 4096,
      maxOutputTokens: 2048,
      inputCostPer1kTokens: 0.0005,
      outputCostPer1kTokens: 0.0015,
    },
    {
      provider: "openai",
      modelName: "dall-e-3",
      displayName: "DALL-E 3",
      category: "image",
      description: "Generate high-quality images from text",
      contextWindow: 0,
      maxOutputTokens: 0,
      inputCostPer1kTokens: 0.08,
      outputCostPer1kTokens: 0,
    },
  ];

  // Anthropic Models
  const anthropicModels = [
    {
      provider: "anthropic",
      modelName: "claude-opus-4-20250514",
      displayName: "Claude Opus 4",
      category: "text",
      description: "Most capable model for complex reasoning and analysis",
      contextWindow: 200000,
      maxOutputTokens: 4096,
      inputCostPer1kTokens: 0.015,
      outputCostPer1kTokens: 0.075,
    },
    {
      provider: "anthropic",
      modelName: "claude-sonnet-4-20250514",
      displayName: "Claude Sonnet 4",
      category: "text",
      description: "Balanced model for quality and speed",
      contextWindow: 200000,
      maxOutputTokens: 4096,
      inputCostPer1kTokens: 0.003,
      outputCostPer1kTokens: 0.015,
    },
    {
      provider: "anthropic",
      modelName: "claude-haiku-3-5-20241022",
      displayName: "Claude Haiku 3.5",
      category: "text",
      description: "Fast and compact model for simple tasks",
      contextWindow: 200000,
      maxOutputTokens: 1024,
      inputCostPer1kTokens: 0.0008,
      outputCostPer1kTokens: 0.0024,
    },
  ];

  // Google Models
  const googleModels = [
    {
      provider: "google",
      modelName: "gemini-2.0-flash",
      displayName: "Gemini 2.0 Flash",
      category: "text",
      description: "Latest ultra-fast model with superior performance",
      contextWindow: 1000000,
      maxOutputTokens: 8192,
      inputCostPer1kTokens: 0.00075,
      outputCostPer1kTokens: 0.003,
    },
    {
      provider: "google",
      modelName: "gemini-1.5-pro",
      displayName: "Gemini 1.5 Pro",
      category: "text",
      description: "Professional-grade model with long context",
      contextWindow: 1000000,
      maxOutputTokens: 8192,
      inputCostPer1kTokens: 0.00375,
      outputCostPer1kTokens: 0.015,
    },
    {
      provider: "google",
      modelName: "gemini-1.5-flash",
      displayName: "Gemini 1.5 Flash",
      category: "text",
      description: "Fast lightweight model",
      contextWindow: 1000000,
      maxOutputTokens: 8192,
      inputCostPer1kTokens: 0.000075,
      outputCostPer1kTokens: 0.0003,
    },
    {
      provider: "google",
      modelName: "gemini-pro",
      displayName: "Gemini Pro",
      category: "text",
      description: "Reliable standard model",
      contextWindow: 32000,
      maxOutputTokens: 8192,
      inputCostPer1kTokens: 0.00025,
      outputCostPer1kTokens: 0.0005,
    },
  ];

  const allModels = [...openaiModels, ...anthropicModels, ...googleModels];

  for (const model of allModels) {
    try {
      await prisma.aIModel.upsert({
        where: { provider_modelName: { provider: model.provider, modelName: model.modelName } },
        update: {},
        create: {
          ...model,
          enabled: true,
          deprecated: false,
        },
      });
      console.log(`✓ Seeded ${model.displayName}`);
    } catch (error) {
      console.error(`✗ Failed to seed ${model.displayName}:`, error);
    }
  }

  console.log("✅ AI Models seeding complete!");
}

seedAIModels()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
