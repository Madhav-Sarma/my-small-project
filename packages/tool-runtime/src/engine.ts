import { generateId } from "@aios/utils";
import { HandlerRegistry } from "./handler-registry.js";
import { OutputRouter } from "./output-router.js";
import type { ToolConfig, ToolInput, ExecutionContext, ExecutionResult } from "./types.js";

/**
 * Universal Tool Runtime Engine
 *
 * Flow:
 *   User Input → Tool Configuration → Runtime Handler → AI Gateway / API → Output → Editor
 */
export class ToolRuntimeEngine {
  constructor(
    private registry: HandlerRegistry,
    private router: OutputRouter,
  ) {}

  async execute(config: ToolConfig, input: ToolInput, context: ExecutionContext): Promise<ExecutionResult> {
    const jobId = generateId();
    const startTime = Date.now();

    // 1. Resolve handler
    const handler = this.registry.get(config.handlerType);
    if (!handler) {
      return { success: false, error: `No handler registered for type: ${config.handlerType}`, creditsCharged: 0, jobId };
    }

    // 2. Validate input
    const validation = handler.validateInput(input, config.inputSchema);
    if (!validation.valid) {
      return { success: false, error: `Validation failed: ${validation.errors.join(", ")}`, creditsCharged: 0, jobId };
    }

    // 3. Estimate cost & check credits
    const estimatedCredits = handler.estimateCost(input, config);
    if (context.creditsAvailable < estimatedCredits) {
      return { success: false, error: "Insufficient credits", creditsCharged: 0, jobId };
    }

    // 4. Execute
    try {
      const output = await handler.execute(input, config, context);
      return {
        success: true,
        output,
        creditsCharged: estimatedCredits,
        jobId,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown execution error";
      return { success: false, error: message, creditsCharged: 0, jobId };
    }
  }

  /**
   * Resolve which UI component should render the tool output.
   */
  routeOutput(result: ExecutionResult) {
    if (!result.success || !result.output) return null;
    return this.router.route(result.output.type, result.output.data);
  }
}
