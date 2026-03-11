import express from "express";
import cors from "cors";
import helmet from "helmet";
import Redis from "ioredis";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { authMiddleware, createRateLimiter } from "@aios/auth";
import { scanAndRegisterModules } from "@aios/plugin-system";
import { toolsRouter } from "./routes/tools.js";
import { suitesRouter } from "./routes/suites.js";
import { modelsRouter } from "./routes/models.js";
import { workspacesRouter } from "./routes/workspaces.js";
import { organizationsRouter } from "./routes/organizations.js";
import { marketplaceRouter } from "./routes/marketplace.js";
import { billingRouter } from "./routes/billing.js";
import { agentsRouter } from "./routes/agents.js";
import { workflowsRouter } from "./routes/workflows.js";
import { connectorsRouter } from "./routes/connectors.js";
import { appsRouter } from "./routes/apps.js";
import { settingsRouter } from "./routes/settings.js";
import { usersRouter } from "./routes/users.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.WEB_ORIGIN ?? "http://localhost:3000", credentials: true }));
app.use(express.json({ limit: "10mb" }));

// --- Redis & rate limiting ---
const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";
const redis = new Redis(REDIS_URL, { lazyConnect: true, maxRetriesPerRequest: 3 });

const apiRateLimiter = createRateLimiter(redis, {
  perUser:         { windowMs: 60_000, maxRequests: 120  },
  perWorkspace:    { windowMs: 60_000, maxRequests: 600  },
  perOrganization: { windowMs: 60_000, maxRequests: 1_200 },
});

// Health check (no auth / rate-limit)
app.get("/health", (_req, res) => res.json({ status: "ok", service: "api" }));

// Apply auth + rate limiting to all API routes
app.use("/api/v1", authMiddleware, apiRateLimiter);

// API routes
app.use("/api/v1/tools", toolsRouter);
app.use("/api/v1/models", modelsRouter);
app.use("/api/v1/suites", suitesRouter);
app.use("/api/v1/workspaces", workspacesRouter);
app.use("/api/v1/organizations", organizationsRouter);
app.use("/api/v1/marketplace", marketplaceRouter);
app.use("/api/v1/billing", billingRouter);
app.use("/api/v1/agents", agentsRouter);
app.use("/api/v1/workflows", workflowsRouter);
app.use("/api/v1/connectors", connectorsRouter);
app.use("/api/v1/apps", appsRouter);
app.use("/api/v1/settings", settingsRouter);
app.use("/api/v1/users", usersRouter);

const PORT = process.env.PORT ?? 4000;

async function start() {
  // Scan and auto-register modules at startup
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const modulesDir = path.resolve(__dirname, "../../../modules");
  const { result } = await scanAndRegisterModules(modulesDir);
  console.log(`[API] Registered ${result.registered.length} modules from ${modulesDir}`);

  app.listen(PORT, () => {
    console.log(`[API Server] Running on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error("[API] Failed to start:", err);
  process.exit(1);
});
