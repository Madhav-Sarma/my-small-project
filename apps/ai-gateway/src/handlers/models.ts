import type { Request, Response } from "express";
import { openaiAdapter } from "../providers/openai.adapter.js";
import { anthropicAdapter } from "../providers/anthropic.adapter.js";
import { googleAdapter } from "../providers/google.adapter.js";

const ADAPTERS = {
  openai: openaiAdapter,
  anthropic: anthropicAdapter,
  google: googleAdapter,
} as const;

export function listModels(_req: Request, res: Response) {
  const providers = Object.keys(ADAPTERS);
  res.json({ providers, note: "Use GET /api/v1/models for the full model registry" });
}
