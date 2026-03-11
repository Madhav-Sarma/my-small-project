import { HandlerRegistry } from "../handler-registry.js";
import { TextGenerationHandler } from "./text-generation.js";
import { ImageGenerationHandler } from "./image-generation.js";
import { CodeGenerationHandler } from "./code-generation.js";

export { TextGenerationHandler } from "./text-generation.js";
export { ImageGenerationHandler } from "./image-generation.js";
export { CodeGenerationHandler } from "./code-generation.js";

/**
 * Builds a {@link HandlerRegistry} pre-populated with the three built-in AI handlers:
 *   - `text_generation`  → {@link TextGenerationHandler}
 *   - `image_generation` → {@link ImageGenerationHandler}
 *   - `code_generation`  → {@link CodeGenerationHandler}
 *
 * All handlers route through the AIOS AI Gateway, so they're provider-agnostic
 * from the runtime perspective.
 *
 * @param gatewayUrl - Base URL of the AI Gateway service.
 *   Defaults to the `AI_GATEWAY_URL` environment variable, then `http://localhost:4100`.
 */
export function createDefaultRegistry(
  gatewayUrl: string = process.env["AI_GATEWAY_URL"] ?? "http://localhost:4100",
): HandlerRegistry {
  const registry = new HandlerRegistry();
  registry.register(new TextGenerationHandler(gatewayUrl));
  registry.register(new ImageGenerationHandler(gatewayUrl));
  registry.register(new CodeGenerationHandler(gatewayUrl));
  return registry;
}
