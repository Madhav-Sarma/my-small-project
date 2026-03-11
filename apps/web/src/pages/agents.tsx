import { motion } from "framer-motion";
import { Bot, Plus } from "lucide-react";

const sampleAgents = [
  { id: "1", name: "Research Agent", description: "Autonomous research assistant that gathers, analyzes, and summarizes information", model: "GPT-4o", tools: 5, status: "idle" as const },
  { id: "2", name: "Code Review Agent", description: "Reviews pull requests, suggests improvements, and checks for security issues", model: "Claude Sonnet", tools: 3, status: "running" as const },
  { id: "3", name: "Content Planner", description: "Plans and creates content calendars with AI-generated topic suggestions", model: "GPT-4o Mini", tools: 4, status: "idle" as const },
];

const statusColors = { active: "bg-emerald-500", idle: "bg-white/30", running: "bg-amber-500 animate-pulse" };

export function AgentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Agents</h1>
          <p className="mt-1 text-sm text-white/50">Autonomous AI agents that work for you</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-700">
          <Plus className="h-4 w-4" /> Create Agent
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {sampleAgents.map((agent, i) => (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl transition-colors hover:border-cyan-500/30"
          >
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400">
                <Bot className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-white">{agent.name}</h4>
                  <div className={`h-2 w-2 rounded-full ${statusColors[agent.status]}`} />
                </div>
                <span className="text-xs text-white/40">{agent.model}</span>
              </div>
            </div>
            <p className="mb-3 text-sm leading-relaxed text-white/60">{agent.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/40">{agent.tools} tools equipped</span>
              <button className="rounded-lg bg-cyan-500/80 px-3 py-1.5 text-xs text-white hover:bg-cyan-500">
                Run Agent
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
