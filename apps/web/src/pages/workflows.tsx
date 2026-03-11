import { motion } from "framer-motion";
import { GitBranch, Plus, Play } from "lucide-react";

const sampleWorkflows = [
  { id: "1", name: "Content Pipeline", description: "Research → Write → Edit → SEO → Publish", nodeCount: 5, status: "active" },
  { id: "2", name: "Code Review Flow", description: "PR Opened → Analyze → Security Check → Approve", nodeCount: 4, status: "active" },
  { id: "3", name: "Data Processing", description: "Ingest → Transform → Validate → Store → Notify", nodeCount: 5, status: "draft" },
];

export function WorkflowsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Workflows</h1>
          <p className="mt-1 text-sm text-white/50">Visual automation chains for complex tasks</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
          <Plus className="h-4 w-4" /> New Workflow
        </button>
      </div>

      <div className="space-y-3">
        {sampleWorkflows.map((wf, i) => (
          <motion.div
            key={wf.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl transition-colors hover:border-emerald-500/20"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
              <GitBranch className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-white">{wf.name}</h4>
              <p className="mt-0.5 text-sm text-white/50">{wf.description}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/40">{wf.nodeCount} nodes</span>
              <span className={`rounded-full px-2 py-0.5 text-xs ${
                wf.status === "active"
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-white/10 text-white/50"
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
    </div>
  );
}
