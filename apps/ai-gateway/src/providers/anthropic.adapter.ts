import Anthropic from "@anthropic-ai/sdk";
import type { AIProviderAdapter, TextGenerationRequest, TextGenerationResponse, ImageGenerationRequest, ImageGenerationResponse, ModelInfo } from "./adapter-interface.js";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export class AnthropicAdapter implements AIProviderAdapter {
  async generateText(request: TextGenerationRequest): Promise<TextGenerationResponse> {
    const systemMessage = request.systemPrompt || request.messages.find((m) => m.role === "system")?.content || "";
    const messages = request.messages
      .filter((m) => m.role !== "system")
      .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

    const response = await client.messages.create({
      model: request.model,
      max_tokens: request.maxTokens ?? 4096,
      system: systemMessage,
      messages: messages as any,
    });

    const textBlock = response.content.find((b) => b.type === "text");
    const toolUseBlocks = response.content.filter((b) => b.type === "tool_use");

    const toolCalls = toolUseBlocks.length > 0 
      ? toolUseBlocks.map((b: any) => ({
          id: b.id,
          name: b.name,
          arguments: b.input || {},
        }))
      : undefined;

    return {
      id: response.id,
      model: response.model,
      content: textBlock?.type === "text" ? textBlock.text : "",
      toolCalls,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        totalTokens: response.usage.input_tokens + response.usage.output_tokens,
      },
    };
  }

  async generateImage(_request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    // Anthropic does not support image generation directly
    // Images would need to be handled by Claude's vision capabilities for analysis, not generation
    throw new Error("Anthropic does not support image generation");
  }

  async getModelInfo(modelName: string): Promise<ModelInfo> {
    // Anthropic model specifications
    const specs: Record<string, Omit<ModelInfo, "id">> = {
      "claude-opus-4-20250514": {
        name: "Claude Opus 4",
        provider: "anthropic",
        contextWindow: 200000,
        maxOutputTokens: 4096,
        costPer1kInputTokens: 0.015,
        costPer1kOutputTokens: 0.075,
      },
      "claude-sonnet-4-20250514": {
        name: "Claude Sonnet 4",
        provider: "anthropic",
        contextWindow: 200000,
        maxOutputTokens: 4096,
        costPer1kInputTokens: 0.003,
        costPer1kOutputTokens: 0.015,
      },
      "claude-haiku-3-5-20241022": {
        name: "Claude Haiku 3.5",
        provider: "anthropic",
        contextWindow: 200000,
        maxOutputTokens: 1024,
        costPer1kInputTokens: 0.00080,
        costPer1kOutputTokens: 0.0024,
      },
    };

    const spec = specs[modelName];
    if (!spec) {
      throw new Error(`Unknown Anthropic model: ${modelName}`);
    }

    return {
      id: modelName,
      ...spec,
    };
  }
}

// Legacy function exports for backward compatibility
export async function anthropicChat(req: {
  model: string;
  messages: Array<{ role: string; content: string }>;
  temperature?: number;
  maxTokens?: number;
}): Promise<any> {
  const adapter = new AnthropicAdapter();
  return adapter.generateText({
    model: req.model,
    messages: req.messages as any,
    temperature: req.temperature,
    maxTokens: req.maxTokens,
  });
}

export const anthropicAdapter = new AnthropicAdapter();
