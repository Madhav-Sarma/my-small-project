/**
 * Provider Adapter Interface
 * All AI provider adapters must implement this interface
 */

export interface AIProviderAdapter {
  /**
   * Generate text using the provider's API
   */
  generateText(request: TextGenerationRequest): Promise<TextGenerationResponse>;

  /**
   * Generate images using the provider's API
   */
  generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse>;

  /**
   * Get provider-specific model information
   */
  getModelInfo(modelName: string): Promise<ModelInfo>;
}

export interface TextGenerationRequest {
  model: string;
  messages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }>;
  temperature?: number;
  maxTokens?: number;
  tools?: unknown[];
  systemPrompt?: string;
}

export interface TextGenerationResponse {
  id: string;
  model: string;
  content: string;
  toolCalls?: Array<{
    id: string;
    name: string;
    arguments: Record<string, unknown>;
  }>;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
}

export interface ImageGenerationRequest {
  prompt: string;
  model?: string;
  size?: string;
  style?: string;
  n?: number;
  quality?: string;
}

export interface ImageGenerationResponse {
  images: Array<{
    url: string;
    revisedPrompt?: string;
  }>;
  model: string;
}

export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  contextWindow: number;
  maxOutputTokens: number;
  costPer1kInputTokens: number;
  costPer1kOutputTokens: number;
}

/**
 * Provider routing helper
 * Maps model IDs to provider adapters
 */
export class ProviderRouter {
  private adapters: Map<string, AIProviderAdapter> = new Map();
  private modelToProvider: Map<string, string> = new Map();

  registerAdapter(provider: string, adapter: AIProviderAdapter): void {
    this.adapters.set(provider, adapter);
  }

  registerModelRoute(modelId: string, provider: string): void {
    this.modelToProvider.set(modelId, provider);
  }

  getAdapter(provider: string): AIProviderAdapter | undefined {
    return this.adapters.get(provider);
  }

  getProviderForModel(modelId: string): string | undefined {
    return this.modelToProvider.get(modelId);
  }

  async generateText(modelId: string, request: TextGenerationRequest): Promise<TextGenerationResponse & { provider: string }> {
    const provider = this.getProviderForModel(modelId);
    if (!provider) {
      throw new Error(`No provider registered for model: ${modelId}`);
    }

    const adapter = this.getAdapter(provider);
    if (!adapter) {
      throw new Error(`Adapter not found for provider: ${provider}`);
    }

    const response = await adapter.generateText(request);
    return { ...response, provider };
  }

  async generateImage(modelId: string, request: ImageGenerationRequest): Promise<ImageGenerationResponse & { provider: string }> {
    const provider = this.getProviderForModel(modelId);
    if (!provider) {
      throw new Error(`No provider registered for model: ${modelId}`);
    }

    const adapter = this.getAdapter(provider);
    if (!adapter) {
      throw new Error(`Adapter not found for provider: ${provider}`);
    }

    const response = await adapter.generateImage(request);
    return { ...response, provider };
  }
}
