import type { Request, Response } from "express";
import { resolveModel, openaiChat, anthropicChat, googleChat } from "../providers/index.js";
import type { ChatRequest } from "../types.js";

export async function chatCompletion(req: Request, res: Response) {
  try {
    const body = req.body as ChatRequest;
    const route = resolveModel(body.model);
    if (!route) {
      res.status(400).json({ error: `Unknown model: ${body.model}` });
      return;
    }

    const providerRequest: ChatRequest = { ...body, model: route.modelId };

    let result;
    switch (route.provider) {
      case "openai":
        result = await openaiChat(providerRequest);
        break;
      case "anthropic":
        result = await anthropicChat(providerRequest);
        break;
      case "google":
        result = await googleChat(providerRequest);
        break;
      default:
        res.status(400).json({ error: `Provider "${route.provider}" not yet implemented` });
        return;
    }

    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Chat completion failed";
    res.status(500).json({ error: message });
  }
}
