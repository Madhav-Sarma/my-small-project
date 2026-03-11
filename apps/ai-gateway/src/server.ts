import express from "express";
import Redis from "ioredis";
import { authMiddleware, createRateLimiter } from "@aios/auth";
import { router } from "./routes.js";

const app = express();
app.use(express.json({ limit: "10mb" }));

// --- Redis & rate limiting ---
const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";
const redis = new Redis(REDIS_URL, { lazyConnect: true, maxRetriesPerRequest: 3 });

// AI Gateway rate limits are tighter: inference is expensive
const gatewayRateLimiter = createRateLimiter(redis, {
  perUser:         { windowMs: 60_000, maxRequests: 30  },
  perOrganization: { windowMs: 60_000, maxRequests: 200 },
});

// Health check (no auth)
app.get("/health", (_req, res) => res.json({ status: "ok", service: "ai-gateway" }));

// Apply auth + rate limiting to all AI routes
app.use("/v1", authMiddleware, gatewayRateLimiter, router);

const PORT = process.env.AI_GATEWAY_PORT ?? 4100;
app.listen(PORT, () => {
  console.log(`[AI Gateway] Running on port ${PORT}`);
});
