export interface ConnectorDefinition {
  id: string;
  name: string;
  description: string;
  version: string;
  authType: "OAUTH2" | "API_KEY" | "BASIC" | "BEARER" | "NONE";
  baseUrl: string;
  actions: { id: string; name: string; method: string; path: string }[];
  events?: { id: string; name: string; type: "webhook" | "polling" }[];
}

export function defineConnector(definition: ConnectorDefinition): ConnectorDefinition {
  return definition;
}
