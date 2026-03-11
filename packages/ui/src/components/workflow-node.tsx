import React from "react";
import { cn } from "@aios/design-system";

interface WorkflowNodeProps {
  type: "trigger" | "action" | "condition" | "transform" | "output";
  label: string;
  icon?: React.ReactNode;
  selected?: boolean;
  className?: string;
}

const typeColors = {
  trigger: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
  action: "border-indigo-500/40 bg-indigo-500/10 text-indigo-400",
  condition: "border-amber-500/40 bg-amber-500/10 text-amber-400",
  transform: "border-violet-500/40 bg-violet-500/10 text-violet-400",
  output: "border-cyan-500/40 bg-cyan-500/10 text-cyan-400",
};

export function WorkflowNode({
  type,
  label,
  icon,
  selected,
  className,
}: WorkflowNodeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium backdrop-blur-sm transition-all",
        typeColors[type],
        selected && "ring-2 ring-white/30",
        className
      )}
    >
      {icon && <span className="h-4 w-4">{icon}</span>}
      <span>{label}</span>
    </div>
  );
}
