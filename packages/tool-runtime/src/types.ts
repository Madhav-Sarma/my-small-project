export type HandlerType =
  | "text_generation"
  | "image_generation"
  | "video_generation"
  | "code_generation"
  | "data_analysis"
  | "api_connector"
  | "workflow_execution";

export type OutputType =
  | "text_document"
  | "code_project"
  | "editable_image"
  | "raw_json"
  | "file_download";

export interface ToolConfig {
  toolId: string;
  name: string;
  handlerType: HandlerType;
  defaultModel: string;
  inputSchema: Record<string, unknown>;
  outputType: OutputType;
  promptTemplate?: string;
  pricingCredits: number;
  apiProvider?: string;
}

export interface ToolInput {
  parameters: Record<string, unknown>;
  model?: string;
  overrides?: Record<string, unknown>;
}

export interface ToolOutput {
  type: OutputType;
  data: unknown;
  metadata: {
    tokensUsed?: number;
    model: string;
    provider: string;
    executionTimeMs: number;
  };
}

export interface ExecutionContext {
  userId: string;
  workspaceId: string;
  organizationId: string;
  creditsAvailable: number;
}

export interface ExecutionResult {
  success: boolean;
  output?: ToolOutput;
  error?: string;
  creditsCharged: number;
  jobId: string;
}

export interface RuntimeHandler {
  type: HandlerType;
  name: string;
  execute(input: ToolInput, config: ToolConfig, context: ExecutionContext): Promise<ToolOutput>;
  validateInput(input: ToolInput, schema: Record<string, unknown>): { valid: boolean; errors: string[] };
  estimateCost(input: ToolInput, config: ToolConfig): number;
}
