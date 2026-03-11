import type { ConnectorDefinition, ConnectorRequest, ConnectorResponse, ConnectorAuth } from "./types.js";

/**
 * Manages registered MCP connectors and executes actions against external services.
 */
export class ConnectorManager {
  private connectors = new Map<string, ConnectorDefinition>();

  register(connector: ConnectorDefinition): void {
    this.connectors.set(connector.slug, connector);
  }

  unregister(slug: string): boolean {
    return this.connectors.delete(slug);
  }

  get(slug: string): ConnectorDefinition | undefined {
    return this.connectors.get(slug);
  }

  listAll(): ConnectorDefinition[] {
    return Array.from(this.connectors.values());
  }

  getActions(slug: string) {
    return this.connectors.get(slug)?.actions ?? [];
  }

  getEvents(slug: string) {
    return this.connectors.get(slug)?.events ?? [];
  }
}
