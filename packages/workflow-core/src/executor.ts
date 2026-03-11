import { generateId } from "@aios/utils";
import { WorkflowGraph } from "./graph.js";
import type {
  WorkflowDefinition,
  WorkflowContext,
  WorkflowResult,
  NodeExecutionFn,
  WorkflowNodeType,
} from "./types.js";

/**
 * Executes a workflow by topologically traversing the graph.
 */
export class WorkflowExecutor {
  private nodeHandlers = new Map<WorkflowNodeType, NodeExecutionFn>();

  registerNodeHandler(type: WorkflowNodeType, fn: NodeExecutionFn): void {
    this.nodeHandlers.set(type, fn);
  }

  async execute(definition: WorkflowDefinition, triggerData: Record<string, unknown>, baseContext: Omit<WorkflowContext, "executionId" | "variables">): Promise<WorkflowResult> {
    const executionId = generateId();
    const context: WorkflowContext = {
      ...baseContext,
      workflowId: definition.id,
      executionId,
      variables: { ...triggerData },
    };

    const graph = new WorkflowGraph(definition);
    const sortedIds = graph.topologicalSort();
    const nodeResults = new Map<string, { output: unknown; status: string }>();

    try {
      for (const nodeId of sortedIds) {
        const node = graph.getNode(nodeId);
        if (!node) continue;

        const handler = this.nodeHandlers.get(node.type);
        if (!handler) {
          nodeResults.set(nodeId, { output: null, status: "skipped" });
          continue;
        }

        const output = await handler(node, context.variables, context);
        nodeResults.set(nodeId, { output, status: "completed" });

        // Merge output into context variables for downstream nodes
        if (output && typeof output === "object") {
          Object.assign(context.variables, output);
        }
      }

      return { success: true, executionId, nodeResults };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Workflow execution failed";
      return { success: false, executionId, nodeResults, error: message };
    }
  }
}
