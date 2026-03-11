import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bot, Plus, Loader2 } from "lucide-react";
import { api } from "../lib/api";

interface AgentItem {
  id: string;
  name: string;
  description: string | null;
  model: string | null;
  status: string;
  tools?: { tool: { name: string } }[];
}

const statusColors: Record<string, string> = { active: "bg-emerald-500", idle: "bg-t-muted", running: "bg-amber-500 animate-pulse" };

export function AgentsPage() {
  const [agents, setAgents] = useState<AgentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.agents.list()
      .then((res) => setAgents(res.data as AgentItem[]))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-t-primary">Agents</h1>
          <p className="mt-1 text-sm text-t-secondary">Autonomous AI agents that work for you</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-700">
          <Plus className="h-4 w-4" /> Create Agent
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-t-muted">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading agents…
        </div>
      ) : agents.length === 0 ? (
        <div className="py-20 text-center text-t-muted">No agents yet. Create one to get started.</div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {agents.map((agent, i) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl border border-border bg-card p-5 backdrop-blur-xl transition-colors hover:border-a-cyan-text/30"
            >
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-a-cyan-bg text-a-cyan-text">
                  <Bot className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-t-primary">{agent.name}</h4>
                    <div className={`h-2 w-2 rounded-full ${statusColors[agent.status] ?? "bg-t-muted"}`} />
                  </div>
                  <span className="text-xs text-t-muted">{agent.model ?? "No model"}</span>
                </div>
              </div>
              <p className="mb-3 text-sm leading-relaxed text-t-secondary">{agent.description ?? ""}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-t-muted">{agent.tools?.length ?? 0} tools equipped</span>
                <button className="rounded-lg bg-cyan-500/80 px-3 py-1.5 text-xs text-white hover:bg-cyan-500">
                  Run Agent
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
