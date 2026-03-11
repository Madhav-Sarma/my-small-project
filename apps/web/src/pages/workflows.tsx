import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GitBranch, Plus, Play, Loader2 } from "lucide-react";
import { api } from "../lib/api";

interface WorkflowItem {
  id: string;
  name: string;
  description: string | null;
  status: string;
  nodes?: unknown[];
}

export function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<WorkflowItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.workflows.list()
      .then((res) => setWorkflows(res.data as WorkflowItem[]))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-t-primary">Workflows</h1>
          <p className="mt-1 text-sm text-t-secondary">Visual automation chains for complex tasks</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
          <Plus className="h-4 w-4" /> New Workflow
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-t-muted">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading workflows…
        </div>
      ) : workflows.length === 0 ? (
        <div className="py-20 text-center text-t-muted">No workflows yet. Create one to get started.</div>
      ) : (
        <div className="space-y-3">
          {workflows.map((wf, i) => (
            <motion.div
              key={wf.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 backdrop-blur-xl transition-colors hover:border-a-emerald-text/20"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-a-emerald-bg text-a-emerald-text">
                <GitBranch className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-t-primary">{wf.name}</h4>
                <p className="mt-0.5 text-sm text-t-secondary">{wf.description ?? ""}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-t-muted">{wf.nodes?.length ?? 0} nodes</span>
                <span className={`rounded-full px-2 py-0.5 text-xs ${
                  wf.status === "active"
                    ? "bg-a-emerald-bg text-a-emerald-text"
                    : "bg-hover text-t-secondary"
                }`}>
                  {wf.status}
                </span>
                <button className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/80 text-white hover:bg-emerald-500">
                  <Play className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
