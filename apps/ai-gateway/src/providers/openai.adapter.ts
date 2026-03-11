import OpenAI from "openai";
import type { AIProviderAdapter, TextGenerationRequest, TextGenerationResponse, ImageGenerationRequest, ImageGenerationResponse, ModelInfo } from "./adapter-interface.js";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export class OpenAIAdapter implements AIProviderAdapter {
  async generateText(request: TextGenerationRequest): Promise<TextGenerationResponse> {
    const response = await client.chat.completions.create({
      model: request.model,
      messages: request.messages,
      temperature: request.temperature ?? 0.7,
      max_tokens: request.maxTokens ?? 4096,
      tools: request.tools as any,
    });

    const choice = response.choices[0];
    const toolCalls = choice?.message?.tool_calls?.map((tc) => ({
      id: tc.id,
      name: tc.function.name,
      arguments: JSON.parse(tc.function.arguments),
    }));

    return {
      id: response.id,
      model: response.model,
      content: choice?.message?.content ?? "",
      toolCalls,
      usage: {
        inputTokens: response.usage?.prompt_tokens ?? 0,
        outputTokens: response.usage?.completion_tokens ?? 0,
        totalTokens: response.usage?.total_tokens ?? 0,
      },
    };
  }

  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    const response = await client.images.generate({
      model: request.model ?? "dall-e-3",
      prompt: request.prompt,
      n: request.n ?? 1,
      size: (request.size ?? "1024x1024") as "1024x1024" | "1792x1024" | "1024x1792",
      quality: (request.quality ?? "standard") as "standard" | "hd",
      style: (request.style ?? "vivid") as "natural" | "vivid",
    });

    return {
      images: (response.data ?? []).map((img) => ({
        url: img.url ?? "",
        revisedPrompt: img.revised_prompt ?? undefined,
      })),
      model: request.model ?? "dall-e-3",
    };
  }

  async getModelInfo(modelName: string): Promise<ModelInfo> {
    // OpenAI model specifications
    const specs: Record<string, Omit<ModelInfo, "id">> = {
      "gpt-4o": {
        name: "GPT-4 Omni",
        provider: "openai",
        contextWindow: 128000,
        maxOutputTokens: 4096,
        costPer1kInputTokens: 0.005,
        costPer1kOutputTokens: 0.015,
      },
      "gpt-4o-mini": {
        name: "GPT-4 Omni Mini",
        provider: "openai",
        contextWindow: 128000,
        maxOutputTokens: 4096,
        costPer1kInputTokens: 0.00015,
        costPer1kOutputTokens: 0.0006,
      },
      "gpt-4-turbo": {
        name: "GPT-4 Turbo",
        provider: "openai",
        contextWindow: 128000,
        maxOutputTokens: 4096,
        costPer1kInputTokens: 0.01,
        costPer1kOutputTokens: 0.03,
      },
      "gpt-3.5-turbo": {
        name: "GPT-3.5 Turbo",
        provider: "openai",
        contextWindow: 4096,
        maxOutputTokens: 2048,
        costPer1kInputTokens: 0.0005,
        costPer1kOutputTokens: 0.0015,
      },
      "dall-e-3": {
        name: "DALL-E 3",
        provider: "openai",
        contextWindow: 0,
        maxOutputTokens: 0,
        costPer1kInputTokens: 0.08, // per image
        costPer1kOutputTokens: 0,
      },
    };

    const spec = specs[modelName];
    if (!spec) {
      throw new Error(`Unknown OpenAI model: ${modelName}`);
    }

    return {
      id: modelName,
      ...spec,
    };
  }
}

// Legacy function exports for backward compatibility
export async function openaiChat(req: {
  model: string;
  messages: Array<{ role: string; content: string }>;
  temperature?: number;
  maxTokens?: number;
}): Promise<any> {
  const adapter = new OpenAIAdapter();
  return adapter.generateText({
    model: req.model,
    messages: req.messages as any,
    temperature: req.temperature,
    maxTokens: req.maxTokens,
  });
}

export async function openaiImage(prompt: string, size: string = "1024x1024"): Promise<any> {
  const adapter = new OpenAIAdapter();
  return adapter.generateImage({ prompt, model: "dall-e-3", size });
}

export const openaiAdapter = new OpenAIAdapter();
