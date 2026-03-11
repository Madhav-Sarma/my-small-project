export type WorkflowNodeType =
  | "trigger"
  | "ai_tool"
  | "api_connector"
  | "logic_condition"
  | "agent_trigger"
  | "data_transformer"
  | "output";

export interface WorkflowNodeDef {
  id: string;
  type: WorkflowNodeType;
  label: string;
  configuration: Record<string, unknown>;
  position: { x: number; y: number };
}

export interface WorkflowEdgeDef {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  condition?: Record<string, unknown>;
  label?: string;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  nodes: WorkflowNodeDef[];
  edges: WorkflowEdgeDef[];
  triggerType: string;
}

export interface WorkflowContext {
  workflowId: string;
  executionId: string;
  workspaceId: string;
  userId: string;
  variables: Record<string, unknown>;
}

export interface WorkflowResult {
  success: boolean;
  executionId: string;
  nodeResults: Map<string, { output: unknown; status: string }>;
  error?: string;
}

export type NodeExecutionFn = (
  node: WorkflowNodeDef,
  input: Record<string, unknown>,
  context: WorkflowContext,
) => Promise<Record<string, unknown>>;
