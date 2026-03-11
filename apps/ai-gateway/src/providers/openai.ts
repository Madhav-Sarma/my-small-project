import OpenAI from "openai";
import type { ChatRequest, ChatResponse } from "../types.js";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function openaiChat(req: ChatRequest): Promise<ChatResponse> {
  const response = await client.chat.completions.create({
    model: req.model,
    messages: req.messages.map((m) => ({ role: m.role as "system" | "user" | "assistant", content: m.content })),
    temperature: req.temperature ?? 0.7,
    max_tokens: req.maxTokens ?? 4096,
  });

  const choice = response.choices[0];
  return {
    id: response.id,
    model: response.model,
    provider: "openai",
    content: choice?.message?.content ?? "",
    usage: {
      inputTokens: response.usage?.prompt_tokens ?? 0,
      outputTokens: response.usage?.completion_tokens ?? 0,
      totalTokens: response.usage?.total_tokens ?? 0,
    },
  };
}

export async function openaiImage(prompt: string, size: string = "1024x1024") {
  const response = await client.images.generate({
    model: "dall-e-3",
    prompt,
    n: 1,
    size: size as "1024x1024" | "1792x1024" | "1024x1792",
  });

  const images = response.data ?? [];

  return {
    images: images.map((img) => ({ url: img.url ?? "", revisedPrompt: img.revised_prompt })),
    model: "dall-e-3",
    provider: "openai" as const,
  };
}
