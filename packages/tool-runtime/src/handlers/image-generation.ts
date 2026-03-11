import type { RuntimeHandler, HandlerType, ToolInput, ToolConfig, ExecutionContext, ToolOutput } from "../types.js";

/**
 * Handles `image_generation` tool requests.
 *
 * Calls the AI Gateway's `/v1/images/generations` endpoint (backed by DALL·E 3).
 * The `prompt` key is required inside `input.parameters`.
 */
export class ImageGenerationHandler implements RuntimeHandler {
  readonly type: HandlerType = "image_generation";
  readonly name = "Image Generation";

  constructor(private readonly gatewayUrl: string) {}

  private resolveEndpoint(context: ExecutionContext): { url: string; headers: Record<string, string> } {
    const gatewayToken = process.env["INTERNAL_GATEWAY_TOKEN"];
    if (!gatewayToken) {
      throw new Error("INTERNAL_GATEWAY_TOKEN is required for AI Gateway communication");
    }

    return {
      url: `${this.gatewayUrl}/v1/images/generations`,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${gatewayToken}`,
        "x-user-id": context.userId,
        "x-org-id": context.organizationId,
      },
    };
  }

  async execute(input: ToolInput, config: ToolConfig, context: ExecutionContext): Promise<ToolOutput> {
    const startTime = Date.now();
    const model = input.model ?? "dall-e-3";
    const prompt = String(input.parameters.prompt ?? "");
    const size = String(input.parameters.size ?? input.overrides?.size ?? "1024x1024");
    const quality = String(input.parameters.quality ?? input.overrides?.quality ?? "standard");

    const { url, headers } = this.resolveEndpoint(context);

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ model, prompt, n: 1, size, quality }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => response.statusText);
      throw new Error(`Image generation error (${response.status}): ${body}`);
    }

    const data = (await response.json()) as {
      data?: Array<{ url?: string; b64_json?: string; revised_prompt?: string }>;
    };

    const imageData = data.data?.[0] ?? {};

    return {
      type: "editable_image",
      data: {
        url: imageData.url ?? null,
        b64Json: imageData.b64_json ?? null,
        revisedPrompt: imageData.revised_prompt ?? prompt,
        prompt,
        size,
      },
      metadata: {
        model,
        provider: config.apiProvider ?? "openai",
        executionTimeMs: Date.now() - startTime,
      },
    };
  }

  validateInput(input: ToolInput, _schema: Record<string, unknown>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!input.parameters || typeof input.parameters !== "object") {
      errors.push("parameters must be an object");
      return { valid: false, errors };
    }
    if (!input.parameters.prompt || typeof input.parameters.prompt !== "string") {
      errors.push("parameters.prompt is required and must be a string");
    }
    return { valid: errors.length === 0, errors };
  }

  estimateCost(_input: ToolInput, config: ToolConfig): number {
    return config.pricingCredits;
  }
}
