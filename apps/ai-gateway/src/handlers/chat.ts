import type { Request, Response } from "express";
import { openaiAdapter } from "../providers/openai.adapter.js";
import { anthropicAdapter } from "../providers/anthropic.adapter.js";
import { googleAdapter } from "../providers/google.adapter.js";
import { ProviderRouter } from "../providers/adapter-interface.js";
import type { ChatRequest } from "../types.js";

// Initialize the provider router with all adapters
const providerRouter = new ProviderRouter();
providerRouter.registerAdapter("openai", openaiAdapter);
providerRouter.registerAdapter("anthropic", anthropicAdapter);
providerRouter.registerAdapter("google", googleAdapter);

/**
 * Resolve the provider for a given model name.
 * Uses known model prefixes to determine the provider.
 */
function resolveProvider(model: string): string | undefined {
  if (model.startsWith("gpt-") || model.startsWith("dall-e") || model.startsWith("o1") || model.startsWith("o3")) return "openai";
  if (model.startsWith("claude-")) return "anthropic";
  if (model.startsWith("gemini-")) return "google";
  return undefined;
}

export async function chatCompletion(req: Request, res: Response) {
  try {
    const body = req.body as ChatRequest;
    const provider = resolveProvider(body.model);

    if (!provider) {
      res.status(400).json({ error: `Unknown model: ${body.model}` });
      return;
    }

    const adapter = providerRouter.getAdapter(provider);
    if (!adapter) {
      res.status(400).json({ error: `Provider "${provider}" not configured` });
      return;
    }

    const result = await adapter.generateText({
      model: body.model,
      messages: body.messages as any,
      temperature: body.temperature,
      maxTokens: body.maxTokens,
      tools: body.tools,
    });

    // Return in the standard ChatResponse format
    res.json({
      id: result.id,
      model: result.model,
      provider,
      content: result.content,
      toolCalls: result.toolCalls,
      usage: result.usage,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Chat completion failed";
    res.status(500).json({ error: message });
  }
}
