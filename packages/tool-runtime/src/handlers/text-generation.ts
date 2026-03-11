import type { RuntimeHandler, HandlerType, ToolInput, ToolConfig, ExecutionContext, ToolOutput } from "../types.js";

/**
 * Handles `text_generation` tool requests.
 *
 * Calls the AI Gateway's `/v1/chat/completions` endpoint, applying an optional
 * Mustache-style prompt template (`{{variable}}`) before dispatching.
 */
export class TextGenerationHandler implements RuntimeHandler {
  readonly type: HandlerType = "text_generation";
  readonly name = "Text Generation";

  constructor(private readonly gatewayUrl: string) {}

  async execute(input: ToolInput, config: ToolConfig, _context: ExecutionContext): Promise<ToolOutput> {
    const startTime = Date.now();
    const model = input.model ?? config.defaultModel;
    const prompt = this.buildPrompt(config.promptTemplate, input.parameters);

    const response = await fetch(`${this.gatewayUrl}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
      throw new Error(`AI Gateway error (${response.status}): ${response.statusText}`);
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
