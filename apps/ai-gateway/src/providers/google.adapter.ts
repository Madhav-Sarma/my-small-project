import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AIProviderAdapter, TextGenerationRequest, TextGenerationResponse, ImageGenerationRequest, ImageGenerationResponse, ModelInfo } from "./adapter-interface.js";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY ?? "");

export class GoogleAdapter implements AIProviderAdapter {
  async generateText(request: TextGenerationRequest): Promise<TextGenerationResponse> {
    const model = genAI.getGenerativeModel({ model: request.model });

    // Filter out system messages for Google API (it only accepts user/assistant alternation)
    const history = request.messages
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

    const lastMessage = history.pop();
    if (!lastMessage) {
      throw new Error("No messages provided");
    }

    const chat = model.startChat({ history: history.length > 0 ? history : undefined });
    const result = await chat.sendMessage(lastMessage.parts[0].text);
    const response = result.response;

    return {
      id: `google-${Date.now()}`,
      model: request.model,
      content: response.text(),
      usage: {
        inputTokens: response.usageMetadata?.promptTokenCount ?? 0,
        outputTokens: response.usageMetadata?.candidatesTokenCount ?? 0,
        totalTokens: response.usageMetadata?.totalTokenCount ?? 0,
      },
    };
  }

  async generateImage(_request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    // Google Generative AI does not support image generation directly
    // Use Imagen or other services for image generation
    throw new Error("Google Generative AI does not support image generation");
  }

  async getModelInfo(modelName: string): Promise<ModelInfo> {
    // Google model specifications
    const specs: Record<string, Omit<ModelInfo, "id">> = {
      "gemini-2.0-flash": {
        name: "Gemini 2.0 Flash",
        provider: "google",
        contextWindow: 1000000,
        maxOutputTokens: 8192,
        costPer1kInputTokens: 0.00075,
        costPer1kOutputTokens: 0.003,
      },
      "gemini-1.5-pro": {
        name: "Gemini 1.5 Pro",
        provider: "google",
        contextWindow: 1000000,
        maxOutputTokens: 8192,
        costPer1kInputTokens: 0.00375,
        costPer1kOutputTokens: 0.015,
      },
      "gemini-1.5-flash": {
        name: "Gemini 1.5 Flash",
        provider: "google",
        contextWindow: 1000000,
        maxOutputTokens: 8192,
        costPer1kInputTokens: 0.000075,
        costPer1kOutputTokens: 0.0003,
      },
      "gemini-pro": {
        name: "Gemini Pro",
        provider: "google",
        contextWindow: 32000,
        maxOutputTokens: 8192,
        costPer1kInputTokens: 0.00025,
        costPer1kOutputTokens: 0.0005,
      },
    };

    const spec = specs[modelName];
    if (!spec) {
      throw new Error(`Unknown Google model: ${modelName}`);
    }

    return {
      id: modelName,
      ...spec,
    };
  }
}

// Legacy function exports for backward compatibility
export async function googleChat(req: {
  model: string;
  messages: Array<{ role: string; content: string }>;
  temperature?: number;
  maxTokens?: number;
}): Promise<any> {
  const adapter = new GoogleAdapter();
  return adapter.generateText({
    model: req.model,
    messages: req.messages as any,
    temperature: req.temperature,
    maxTokens: req.maxTokens,
  });
}

export const googleAdapter = new GoogleAdapter();
