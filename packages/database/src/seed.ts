import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("[AIOS] Seeding database...");

  // ── Runtime Handlers ────────────────────────────────
  const handlers = [
    { handlerType: "text_generation", name: "Text Generation Handler", executionModule: "@aios/handlers/text", supportedModels: ["gpt-4", "gpt-4o", "claude-sonnet", "gemini-pro"] },
    { handlerType: "image_generation", name: "Image Generation Handler", executionModule: "@aios/handlers/image", supportedModels: ["dall-e-3", "stable-diffusion-xl", "midjourney"] },
    { handlerType: "code_generation", name: "Code Generation Handler", executionModule: "@aios/handlers/code", supportedModels: ["gpt-4", "claude-sonnet", "codellama"] },
    { handlerType: "video_generation", name: "Video Generation Handler", executionModule: "@aios/handlers/video", supportedModels: ["runway-gen3", "sora"] },
    { handlerType: "data_analysis", name: "Data Analysis Handler", executionModule: "@aios/handlers/data", supportedModels: ["gpt-4", "claude-sonnet"] },
    { handlerType: "api_connector", name: "API Connector Handler", executionModule: "@aios/handlers/api", supportedModels: [] },
    { handlerType: "workflow_execution", name: "Workflow Execution Handler", executionModule: "@aios/handlers/workflow", supportedModels: [] },
  ];

  for (const h of handlers) {
    await prisma.toolRuntimeHandler.upsert({
      where: { handlerType: h.handlerType },
      update: {},
      create: h,
    });
  }

  // ── Built-in Apps ───────────────────────────────────
  const builtInApps = [
    { slug: "docs", name: "Docs", appType: "docs", description: "Collaborative document editor", entryComponent: "DocsApp", isBuiltIn: true },
    { slug: "ide", name: "IDE", appType: "ide", description: "VSCode-like code editor", entryComponent: "IdeApp", isBuiltIn: true },
    { slug: "paint", name: "Paint", appType: "paint", description: "Whiteboard & drawing canvas", entryComponent: "PaintApp", isBuiltIn: true },
    { slug: "terminal", name: "Terminal", appType: "terminal", description: "Browser terminal", entryComponent: "TerminalApp", isBuiltIn: true },
  ];

  for (const app of builtInApps) {
    await prisma.app.upsert({
      where: { slug: app.slug },
      update: {},
      create: app,
    });
  }

  // ── Sample Tools ────────────────────────────────────
  const sampleTools = [
    { slug: "blog-generator", name: "Blog Generator", category: "writing", handlerType: "text_generation" as const, defaultModel: "gpt-4", inputSchema: { topic: "string", tone: "string", length: "string" }, outputType: "text_document" as const, promptTemplate: "Write a blog post about {{topic}} in {{tone}} tone. Length: {{length}}.", pricingCredits: 10, isBuiltIn: true },
    { slug: "essay-generator", name: "Essay Generator", category: "writing", handlerType: "text_generation" as const, defaultModel: "gpt-4", inputSchema: { topic: "string", style: "string" }, outputType: "text_document" as const, promptTemplate: "Write an essay about {{topic}} in {{style}} style.", pricingCredits: 12, isBuiltIn: true },
    { slug: "code-generator", name: "Code Generator", category: "development", handlerType: "code_generation" as const, defaultModel: "gpt-4", inputSchema: { description: "string", language: "string" }, outputType: "code_project" as const, promptTemplate: "Generate {{language}} code: {{description}}", pricingCredits: 15, isBuiltIn: true },
    { slug: "image-generator", name: "Image Generator", category: "design", handlerType: "image_generation" as const, defaultModel: "dall-e-3", inputSchema: { prompt: "string", style: "string", size: "string" }, outputType: "editable_image" as const, pricingCredits: 20, isBuiltIn: true },
    { slug: "seo-optimizer", name: "SEO Optimizer", category: "marketing", handlerType: "text_generation" as const, defaultModel: "gpt-4", inputSchema: { content: "string", keywords: "string" }, outputType: "text_document" as const, promptTemplate: "Optimize the following content for SEO with keywords {{keywords}}: {{content}}", pricingCredits: 8, isBuiltIn: true },
    { slug: "email-writer", name: "Email Writer", category: "writing", handlerType: "text_generation" as const, defaultModel: "gpt-4", inputSchema: { subject: "string", context: "string" }, outputType: "text_document" as const, promptTemplate: "Write a professional email regarding {{subject}}. Context: {{context}}", pricingCredits: 6, isBuiltIn: true },
  ];

  for (const t of sampleTools) {
    await prisma.tool.upsert({
      where: { slug: t.slug },
      update: {},
      create: t,
    });
  }

  // ── Sample Suites ───────────────────────────────────
  const studentSuite = await prisma.suite.upsert({
    where: { slug: "student-suite" },
    update: {},
    create: { slug: "student-suite", name: "Student Suite", category: "education", description: "Essential tools for students" },
  });

  const creatorSuite = await prisma.suite.upsert({
    where: { slug: "creator-suite" },
    update: {},
    create: { slug: "creator-suite", name: "Creator Suite", category: "content", description: "Tools for content creators" },
  });

  // Link tools to suites
  const essayTool = await prisma.tool.findUnique({ where: { slug: "essay-generator" } });
  const blogTool = await prisma.tool.findUnique({ where: { slug: "blog-generator" } });
  const imageTool = await prisma.tool.findUnique({ where: { slug: "image-generator" } });

  if (essayTool) {
    await prisma.suiteTool.upsert({
      where: { suiteId_toolId: { suiteId: studentSuite.id, toolId: essayTool.id } },
      update: {},
      create: { suiteId: studentSuite.id, toolId: essayTool.id, order: 1 },
    });
  }
  if (blogTool) {
    await prisma.suiteTool.upsert({
      where: { suiteId_toolId: { suiteId: creatorSuite.id, toolId: blogTool.id } },
      update: {},
      create: { suiteId: creatorSuite.id, toolId: blogTool.id, order: 1 },
    });
  }
  if (imageTool) {
    await prisma.suiteTool.upsert({
      where: { suiteId_toolId: { suiteId: creatorSuite.id, toolId: imageTool.id } },
      update: {},
      create: { suiteId: creatorSuite.id, toolId: imageTool.id, order: 2 },
    });
  }

  // ── API Costs ───────────────────────────────────────
  const apiCosts = [
    { provider: "openai", model: "gpt-4", inputCostPer1k: 0.03, outputCostPer1k: 0.06 },
    { provider: "openai", model: "gpt-4o", inputCostPer1k: 0.005, outputCostPer1k: 0.015 },
    { provider: "anthropic", model: "claude-sonnet", inputCostPer1k: 0.003, outputCostPer1k: 0.015 },
    { provider: "google", model: "gemini-pro", inputCostPer1k: 0.00125, outputCostPer1k: 0.005 },
    { provider: "openai", model: "dall-e-3", inputCostPer1k: 0.04, outputCostPer1k: 0 },
  ];

  for (const cost of apiCosts) {
    await prisma.apiCost.create({ data: cost });
  }

  // ── Sample Connectors ──────────────────────────────
  const connectors = [
    { slug: "notion", name: "Notion", authType: "oauth2" as const, baseUrl: "https://api.notion.com/v1", description: "Connect to Notion workspaces" },
    { slug: "slack", name: "Slack", authType: "oauth2" as const, baseUrl: "https://slack.com/api", description: "Connect to Slack channels" },
    { slug: "github", name: "GitHub", authType: "oauth2" as const, baseUrl: "https://api.github.com", description: "Connect to GitHub repositories" },
    { slug: "google-docs", name: "Google Docs", authType: "oauth2" as const, baseUrl: "https://docs.googleapis.com/v1", description: "Connect to Google Docs" },
    { slug: "discord", name: "Discord", authType: "bearer" as const, baseUrl: "https://discord.com/api/v10", description: "Connect to Discord servers" },
    { slug: "stripe", name: "Stripe", authType: "api_key" as const, baseUrl: "https://api.stripe.com/v1", description: "Connect to Stripe billing" },
  ];

  for (const c of connectors) {
    await prisma.connector.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
  }

  console.log("[AIOS] Seed complete.");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
