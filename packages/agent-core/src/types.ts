export interface AgentConfig {
  agentId: string;
  name: string;
  goal: string;
  systemPrompt: string;
  model: string;
  maxIterations: number;
  memoryEnabled: boolean;
  toolIds: string[];
  workflowId?: string;
}

export interface AgentMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  toolCallId?: string;
  metadata?: Record<string, unknown>;
}

export interface AgentStep {
  iteration: number;
  action: string;
  toolId?: string;
  input?: Record<string, unknown>;
  output?: unknown;
  reasoning: string;
}

export interface AgentResult {
  success: boolean;
  agentId: string;
  iterations: number;
  steps: AgentStep[];
  finalOutput: string;
  tokensUsed: number;
  error?: string;
}
