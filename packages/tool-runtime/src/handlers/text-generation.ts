import type { RuntimeHandler, HandlerType, ToolInput, ToolConfig, ExecutionContext, ToolOutput } from "../types.js";

/**
 * Handles `text_generation` tool requests.
 *
 * Routes through the AIOS AI Gateway when it is reachable, or falls back to
 * calling OpenAI directly using OPENAI_API_KEY (useful when only the API
 * service is running locally during development).
 */
export class TextGenerationHandler implements RuntimeHandler {
  readonly type: HandlerType = "text_generation";
  readonly name = "Text Generation";

  constructor(private readonly gatewayUrl: string) {}

  /**
   * Returns { url, headers } for the AI Gateway completions call.
   * All requests are routed through the AI Gateway — no direct provider fallback.
   */
  private resolveEndpoint(context: ExecutionContext): { url: string; headers: Record<string, string> } {
    const gatewayToken = process.env["INTERNAL_GATEWAY_TOKEN"];
    if (!gatewayToken) {
      throw new Error("INTERNAL_GATEWAY_TOKEN is required for AI Gateway communication");
    }

    return {
      url: `${this.gatewayUrl}/v1/chat/completions`,
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
    const model = input.model ?? "gpt-4o";
    const prompt = this.buildPrompt(config.promptTemplate, input.parameters);

    const { url, headers } = this.resolveEndpoint(context);

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: "You are a helpful AI writing assistant. Produce clear, well-structured content." },
          { role: "user", content: prompt },
        ],
        ...input.overrides,
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => response.statusText);
      throw new Error(`Text generation error (${response.status}): ${body}`);
    }

    const data = (await response.json()) as {
      choices: Array<{ message: { content: string } }>;
      usage?: { total_tokens?: number };
    };

    const content = data.choices[0]?.message?.content ?? "";

    return {
      type: "text_document",
      data: { content },
      metadata: {
        tokensUsed: data.usage?.total_tokens,
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
    }
    return { valid: errors.length === 0, errors };
  }

  estimateCost(_input: ToolInput, config: ToolConfig): number {
    return config.pricingCredits;
  }

  private buildPrompt(template: string | undefined, parameters: Record<string, unknown>): string {
    if (!template) {
      return Object.entries(parameters)
        .map(([k, v]) => `${k}: ${String(v)}`)
        .join("\n");
    }
    // Replace {{variable}} placeholders with parameter values
    return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => String(parameters[key] ?? ""));
  }
}
