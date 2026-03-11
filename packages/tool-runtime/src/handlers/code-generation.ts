import type { RuntimeHandler, HandlerType, ToolInput, ToolConfig, ExecutionContext, ToolOutput } from "../types.js";

/** Maps common language names to their canonical file extensions. */
const LANGUAGE_EXTENSIONS: Record<string, string> = {
  typescript: "ts",
  javascript: "js",
  python: "py",
  go: "go",
  rust: "rs",
  java: "java",
  cpp: "cpp",
  "c++": "cpp",
  c: "c",
  csharp: "cs",
  "c#": "cs",
  ruby: "rb",
  php: "php",
  swift: "swift",
  kotlin: "kt",
  shell: "sh",
  bash: "sh",
  sql: "sql",
};

function getExtension(language: string): string {
  return LANGUAGE_EXTENSIONS[language.toLowerCase()] ?? language.toLowerCase();
}

/**
 * Handles `code_generation` tool requests.
 *
 * Calls the AI Gateway's `/v1/chat/completions` endpoint with a code-focused system prompt.
 * Wraps the generation result in a `code_project` output containing a single source file.
 *
 * Supported parameters:
 *   - `language`    — target programming language (default: "typescript")
 *   - `description` — what the code should do (required if no promptTemplate)
 *   - `filename`    — override the output filename (optional)
 */
export class CodeGenerationHandler implements RuntimeHandler {
  readonly type: HandlerType = "code_generation";
  readonly name = "Code Generation";

  constructor(private readonly gatewayUrl: string) {}

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
    const model = input.model ?? config.modelId;
    const language = String(input.parameters.language ?? "typescript");
    const filename = String(input.parameters.filename ?? `main.${getExtension(language)}`);
    const prompt = this.buildCodePrompt(config.promptTemplate, input.parameters, language);

    const { url, headers } = this.resolveEndpoint(context);

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: [
              `You are an expert software engineer specialising in ${language}.`,
              "Generate clean, production-ready code that follows best practices.",
              "Return only the code itself — no markdown fences, no prose explanations.",
              "If multiple files are needed, separate them with: // --- FILE: <filename> ---",
            ].join(" "),
          },
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

    const rawContent = data.choices[0]?.message?.content ?? "";

    // Parse multi-file delimiter if the model emitted multiple files
    const files = this.parseFiles(rawContent, filename);

    return {
      type: "code_project",
      data: { files, language },
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
      return { valid: false, errors };
    }
    if (!input.parameters.description && !input.parameters.prompt) {
      errors.push("parameters.description (or parameters.prompt) is required");
    }
    return { valid: errors.length === 0, errors };
  }

  estimateCost(_input: ToolInput, config: ToolConfig): number {
    return config.pricingCredits;
  }

  private buildCodePrompt(
    template: string | undefined,
    parameters: Record<string, unknown>,
    language: string,
  ): string {
    if (template) {
      return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => String(parameters[key] ?? ""));
    }
    const description = String(parameters.description ?? parameters.prompt ?? "");
    const context = parameters.context ? `\n\nAdditional context:\n${String(parameters.context)}` : "";
    return `Write ${language} code that does the following:\n${description}${context}`;
  }

  /** Splits output by the multi-file delimiter the system prompt specifies. */
  private parseFiles(
    raw: string,
    defaultFilename: string,
  ): Array<{ name: string; content: string }> {
    const fileDelimiter = /\/\/ --- FILE: (.+?) ---/g;
    const segments = raw.split(fileDelimiter);

    // segments: [beforeFirst, name1, content1, name2, content2, ...]
    if (segments.length === 1) {
      return [{ name: defaultFilename, content: raw.trim() }];
    }

    const files: Array<{ name: string; content: string }> = [];
    for (let i = 1; i < segments.length; i += 2) {
      const name = segments[i]?.trim() ?? defaultFilename;
      const content = segments[i + 1]?.trim() ?? "";
      files.push({ name, content });
    }
    return files;
  }
}
