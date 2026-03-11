import type { WorkflowDefinition, WorkflowNodeDef, WorkflowEdgeDef } from "./types.js";

/**
 * Topological graph for workflow execution ordering.
 */
export class WorkflowGraph {
  private adjacency = new Map<string, string[]>();
  private nodeMap = new Map<string, WorkflowNodeDef>();

  constructor(definition: WorkflowDefinition) {
    for (const node of definition.nodes) {
      this.nodeMap.set(node.id, node);
      this.adjacency.set(node.id, []);
    }
    for (const edge of definition.edges) {
      this.adjacency.get(edge.sourceNodeId)?.push(edge.targetNodeId);
    }
  }

  /** Get topologically sorted node IDs for execution order. */
  topologicalSort(): string[] {
    const visited = new Set<string>();
    const result: string[] = [];

    const visit = (id: string) => {
      if (visited.has(id)) return;
      visited.add(id);
      for (const neighbor of this.adjacency.get(id) ?? []) {
        visit(neighbor);
      }
      result.unshift(id);
    };

    for (const id of this.nodeMap.keys()) {
      visit(id);
    }

    return result;
  }

  getNode(id: string): WorkflowNodeDef | undefined {
    return this.nodeMap.get(id);
  }

  getChildren(id: string): string[] {
    return this.adjacency.get(id) ?? [];
  }

  getTriggerNodes(): WorkflowNodeDef[] {
    return Array.from(this.nodeMap.values()).filter((n) => n.type === "trigger");
  }
}
