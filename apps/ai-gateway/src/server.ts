import express from "express";
import { router } from "./routes.js";

const app = express();
app.use(express.json({ limit: "10mb" }));

// Health check
app.get("/health", (_req, res) => res.json({ status: "ok", service: "ai-gateway" }));

// AI routes
app.use("/v1", router);

const PORT = process.env.AI_GATEWAY_PORT ?? 4100;
app.listen(PORT, () => {
  console.log(`[AI Gateway] Running on port ${PORT}`);
});
