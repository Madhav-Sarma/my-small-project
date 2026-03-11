import { z } from "zod";

export interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  version: string;
  category: string;
  handlerType: "PROMPT_CHAIN" | "API_CALL" | "CODE_EXEC" | "MULTI_STEP" | "RETRIEVAL" | "HYBRID" | "CUSTOM";
  outputType: "TEXT_DOCUMENT" | "CODE_PROJECT" | "EDITABLE_IMAGE" | "RAW_JSON" | "FILE_DOWNLOAD";
  inputSchema: z.ZodType;
  pricing: { creditsPerUse: number; model: "per_use" | "subscription" | "free" };
  handler: (input: Record<string, unknown>) => Promise<{ success: boolean; data: unknown; creditsUsed: number }>;
}

export function defineTool(definition: ToolDefinition): ToolDefinition {
  return definition;
}
