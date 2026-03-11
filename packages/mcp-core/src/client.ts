import type { ConnectorDefinition, ConnectorAuth, ConnectorResponse } from "./types.js";

/**
 * HTTP client for executing connector actions against external APIs.
 * In production, use native fetch with proper rate limiting.
 */
export class ConnectorClient {
  async execute(
    connector: ConnectorDefinition,
    actionSlug: string,
    parameters: Record<string, unknown>,
    auth: ConnectorAuth,
  ): Promise<ConnectorResponse> {
    const action = connector.actions.find((a) => a.slug === actionSlug);
    if (!action) {
      return { success: false, status: 404, data: null, error: `Action "${actionSlug}" not found on connector "${connector.slug}"` };
    }

    const url = `${connector.baseUrl}${action.path}`;
    const headers: Record<string, string> = { "Content-Type": "application/json" };

    // Apply auth
    switch (auth.type) {
      case "bearer":
        headers["Authorization"] = `Bearer ${auth.credentials.token}`;
        break;
      case "api_key":
        headers["X-API-Key"] = auth.credentials.apiKey;
        break;
      case "basic": {
        const encoded = Buffer.from(`${auth.credentials.username}:${auth.credentials.password}`).toString("base64");
        headers["Authorization"] = `Basic ${encoded}`;
        break;
      }
    }

    try {
      const fetchOptions: RequestInit = {
        method: action.method,
        headers,
      };

      if (action.method !== "GET" && action.method !== "HEAD") {
        fetchOptions.body = JSON.stringify(parameters);
      }

      const response = await fetch(url, fetchOptions);
      const data = await response.json();

      return {
        success: response.ok,
        status: response.status,
        data,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Connector request failed";
      return { success: false, status: 500, data: null, error: message };
    }
  }
}
