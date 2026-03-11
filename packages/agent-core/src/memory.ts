/**
 * In-memory agent memory store with short-term and long-term scopes.
 * In production, back this with Redis / Postgres.
 */
export class AgentMemoryStore {
  private store = new Map<string, Map<string, string>>();

  private getAgentStore(agentId: string): Map<string, string> {
    if (!this.store.has(agentId)) {
      this.store.set(agentId, new Map());
    }
    return this.store.get(agentId)!;
  }

  set(agentId: string, key: string, value: string): void {
    this.getAgentStore(agentId).set(key, value);
  }

  get(agentId: string, key: string): string | undefined {
    return this.getAgentStore(agentId).get(key);
  }

  getAll(agentId: string): Record<string, string> {
    const entries = this.getAgentStore(agentId).entries();
    return Object.fromEntries(entries);
  }

  delete(agentId: string, key: string): void {
    this.getAgentStore(agentId).delete(key);
  }

  clear(agentId: string): void {
    this.store.delete(agentId);
  }
}
