import type { ToolInput, ExecutionResult } from "@aios/tool-runtime";

/**
 * Blog Generator module handler.
 *
 * Actual execution is delegated to the ToolRuntimeEngine's
 * TextGenerationHandler via the manifest's handlerType: "text_generation".
 * This module handler validates inputs and delegates to the runtime pipeline.
 */
export default async function handler(input: ToolInput): Promise<ExecutionResult> {
  const { topic } = input.parameters as { topic?: string };

  if (!topic || typeof topic !== "string" || !topic.trim()) {
    return {
      success: false,
      jobId: "validation",
      creditsCharged: 0,
      error: "Topic is required for blog generation",
    };
  }

  // Actual execution is handled by the ToolRuntimeEngine pipeline.
  // This handler is a plugin-system activation hook only.
  throw new Error("Blog generation must be executed through the ToolRuntimeEngine pipeline");
}
