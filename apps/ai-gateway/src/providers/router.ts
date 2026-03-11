import type { AIProvider } from "../types.js";

interface ModelRoute {
  provider: AIProvider;
  modelId: string;
  fallbacks: string[];
}

/**
 * Maps model aliases to provider-specific model IDs, with fallback chains.
 */
const MODEL_ROUTES: Record<string, ModelRoute> = {
  "gpt-4":         { provider: "openai",    modelId: "gpt-4",               fallbacks: ["gpt-4o"] },
  "gpt-4o":        { provider: "openai",    modelId: "gpt-4o",              fallbacks: ["gpt-4"] },
  "gpt-4o-mini":   { provider: "openai",    modelId: "gpt-4o-mini",         fallbacks: ["gpt-4o"] },
  "claude-sonnet": { provider: "anthropic", modelId: "claude-sonnet-4-20250514",  fallbacks: ["gpt-4o"] },
  "claude-opus":   { provider: "anthropic", modelId: "claude-opus-4-20250514",    fallbacks: ["claude-sonnet"] },
  "gemini-pro":    { provider: "google",    modelId: "gemini-pro",           fallbacks: ["gpt-4o"] },
  "gemini-flash":  { provider: "google",    modelId: "gemini-2.0-flash",     fallbacks: ["gemini-pro"] },
  "dall-e-3":      { provider: "openai",    modelId: "dall-e-3",             fallbacks: [] },
};

export function resolveModel(model: string): ModelRoute | undefined {
  return MODEL_ROUTES[model];
}

export function getFallbackModel(model: string): string | undefined {
  const route = MODEL_ROUTES[model];
  return route?.fallbacks[0];
}

export function listAllModels(): Array<{ alias: string } & ModelRoute> {
  return Object.entries(MODEL_ROUTES).map(([alias, route]) => ({ alias, ...route }));
}
