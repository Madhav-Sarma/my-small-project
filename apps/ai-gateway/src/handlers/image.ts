import type { Request, Response } from "express";
import { openaiImage } from "../providers/index.js";

export async function imageGeneration(req: Request, res: Response) {
  try {
    const { prompt, size } = req.body as { prompt: string; size?: string };
    if (!prompt) {
      res.status(400).json({ error: "prompt is required" });
      return;
    }

    const result = await openaiImage(prompt, size);
    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Image generation failed";
    res.status(500).json({ error: message });
  }
}
