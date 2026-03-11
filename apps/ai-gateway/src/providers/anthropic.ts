import Anthropic from "@anthropic-ai/sdk";
import type { ChatRequest, ChatResponse } from "../types.js";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function anthropicChat(req: ChatRequest): Promise<ChatResponse> {
  const systemMessage = req.messages.find((m) => m.role === "system")?.content ?? "";
  const messages = req.messages
    .filter((m) => m.role !== "system")
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

  const response = await client.messages.create({
    model: req.model,
    max_tokens: req.maxTokens ?? 4096,
    system: systemMessage,
    messages,
  });

  const textBlock = response.content.find((b) => b.type === "text");
  return {
    id: response.id,
    model: response.model,
    provider: "anthropic",
    content: textBlock?.type === "text" ? textBlock.text : "",
    usage: {
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      totalTokens: response.usage.input_tokens + response.usage.output_tokens,
    },
  };
}
