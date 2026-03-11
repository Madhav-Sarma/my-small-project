export type AIProvider = "openai" | "anthropic" | "google" | "replicate" | "huggingface";

export interface ChatRequest {
  model: string;
  messages: Array<{ role: string; content: string }>;
  temperature?: number;
  maxTokens?: number;
  tools?: unknown[];
}

export interface ChatResponse {
  id: string;
  model: string;
  provider: AIProvider;
  content: string;
  toolCalls?: Array<{ id: string; name: string; arguments: Record<string, unknown> }>;
  usage: { inputTokens: number; outputTokens: number; totalTokens: number };
}

export interface ImageRequest {
  prompt: string;
  model?: string;
  size?: string;
  style?: string;
  n?: number;
}

export interface ImageResponse {
  images: Array<{ url: string; revisedPrompt?: string }>;
  model: string;
  provider: AIProvider;
}

export interface ModelInfo {
  id: string;
  provider: AIProvider;
  type: "chat" | "image" | "embedding" | "code";
  maxTokens: number;
}
