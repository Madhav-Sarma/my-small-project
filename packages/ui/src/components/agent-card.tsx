import React from "react";
import { cn } from "@aios/design-system";
import { motion } from "framer-motion";
import { Bot } from "lucide-react";

interface AgentCardProps {
  name: string;
  description: string;
  model?: string;
  toolCount?: number;
  icon?: React.ReactNode;
  status?: "active" | "idle" | "running";
  onRun?: () => void;
  className?: string;
}

const statusColors = {
  active: "bg-emerald-500",
  idle: "bg-white/30",
  running: "bg-amber-500 animate-pulse",
};

export function AgentCard({
  name,
  description,
  model,
  toolCount,
  icon,
  status = "idle",
  onRun,
  className,
}: AgentCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={cn(
        "group relative rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl transition-colors hover:border-cyan-500/30",
        className
      )}
    >
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400">
          {icon || <Bot className="h-5 w-5" />}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-white">{name}</h4>
            <div className={cn("h-2 w-2 rounded-full", statusColors[status])} />
          </div>
          {model && <span className="text-xs text-white/40">{model}</span>}
        </div>
      </div>
      <p className="mb-3 text-sm leading-relaxed text-white/60">{description}</p>
      <div className="flex items-center justify-between">
        {toolCount !== undefined && (
          <span className="text-xs text-white/40">{toolCount} tools equipped</span>
        )}
        {onRun && (
          <button
            onClick={onRun}
            className="rounded-lg bg-cyan-500/80 px-3 py-1.5 text-xs text-white transition-colors hover:bg-cyan-500"
          >
            Run Agent
          </button>
        )}
      </div>
    </motion.div>
  );
}
