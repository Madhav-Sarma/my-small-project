export type ConnectorAuthType = "oauth2" | "api_key" | "bearer" | "basic" | "none";

export interface ConnectorAuth {
  type: ConnectorAuthType;
  credentials: Record<string, string>;
}

export interface ConnectorAction {
  name: string;
  slug: string;
  description?: string;
  method: string;
  path: string;
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
}

export interface ConnectorEvent {
  name: string;
  slug: string;
  description?: string;
  payloadSchema: Record<string, unknown>;
}

export interface ConnectorDefinition {
  id: string;
  slug: string;
  name: string;
  baseUrl: string;
  authType: ConnectorAuthType;
  rateLimitPerMin: number;
  actions: ConnectorAction[];
  events: ConnectorEvent[];
}

export interface ConnectorRequest {
  connectorId: string;
  actionSlug: string;
  parameters: Record<string, unknown>;
  auth: ConnectorAuth;
}

export interface ConnectorResponse {
  success: boolean;
  status: number;
  data: unknown;
  headers?: Record<string, string>;
  error?: string;
}
