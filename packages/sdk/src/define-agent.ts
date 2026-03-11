export interface AgentDefinition {
  id: string;
  name: string;
  description: string;
  version: string;
  systemPrompt: string;
  model: string;
  tools: string[];
  maxIterations?: number;
  memory?: { type: "session" | "persistent"; maxEntries?: number };
}

export function defineAgent(definition: AgentDefinition): AgentDefinition {
  return definition;
}
