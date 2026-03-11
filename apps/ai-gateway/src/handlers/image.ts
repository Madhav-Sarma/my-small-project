import type { Request, Response } from "express";
import { openaiAdapter } from "../providers/openai.adapter.js";
import type { ImageRequest } from "../types.js";

export async function imageGeneration(req: Request, res: Response) {
  try {
    const body = req.body as ImageRequest;
    if (!body.prompt) {
      res.status(400).json({ error: "prompt is required" });
      return;
    }

    // Currently only OpenAI supports image generation
    const result = await openaiAdapter.generateImage({
      prompt: body.prompt,
      model: body.model ?? "dall-e-3",
      size: body.size,
      style: body.style,
      n: body.n,
    });

    res.json({
      ...result,
      provider: "openai",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Image generation failed";
    res.status(500).json({ error: message });
  }
}
