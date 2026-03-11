import express from "express";
import cors from "cors";
import helmet from "helmet";
import { toolsRouter } from "./routes/tools.js";
import { suitesRouter } from "./routes/suites.js";
import { workspacesRouter } from "./routes/workspaces.js";
import { organizationsRouter } from "./routes/organizations.js";
import { marketplaceRouter } from "./routes/marketplace.js";
import { billingRouter } from "./routes/billing.js";
import { agentsRouter } from "./routes/agents.js";
import { workflowsRouter } from "./routes/workflows.js";
import { connectorsRouter } from "./routes/connectors.js";
import { appsRouter } from "./routes/apps.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.WEB_ORIGIN ?? "http://localhost:3000", credentials: true }));
app.use(express.json({ limit: "10mb" }));

// Health check
app.get("/health", (_req, res) => res.json({ status: "ok", service: "api" }));

// API routes
app.use("/api/v1/tools", toolsRouter);
app.use("/api/v1/suites", suitesRouter);
app.use("/api/v1/workspaces", workspacesRouter);
app.use("/api/v1/organizations", organizationsRouter);
app.use("/api/v1/marketplace", marketplaceRouter);
app.use("/api/v1/billing", billingRouter);
app.use("/api/v1/agents", agentsRouter);
app.use("/api/v1/workflows", workflowsRouter);
app.use("/api/v1/connectors", connectorsRouter);
app.use("/api/v1/apps", appsRouter);

const PORT = process.env.PORT ?? 4000;
app.listen(PORT, () => {
  console.log(`[API Server] Running on port ${PORT}`);
});
