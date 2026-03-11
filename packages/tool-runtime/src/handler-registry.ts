import type { RuntimeHandler, HandlerType } from "./types.js";

/**
 * Registry mapping handler types to their execution logic.
 *
 * Example registry:
 *   text_generation  → TextHandler
 *   image_generation → ImageHandler
 *   code_generation  → CodeHandler
 *   api_connector    → ConnectorHandler
 */
export class HandlerRegistry {
  private handlers = new Map<HandlerType, RuntimeHandler>();

  register(handler: RuntimeHandler): void {
    this.handlers.set(handler.type, handler);
  }

  get(type: HandlerType): RuntimeHandler | undefined {
    return this.handlers.get(type);
  }

  has(type: HandlerType): boolean {
    return this.handlers.has(type);
  }

  listTypes(): HandlerType[] {
    return Array.from(this.handlers.keys());
  }
}
