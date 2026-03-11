import React from "react";
import { cn } from "@aios/design-system";
import { motion } from "framer-motion";
import { Wrench } from "lucide-react";

interface ToolCardProps {
  name: string;
  description: string;
  icon?: React.ReactNode;
  category?: string;
  credits?: number;
  installed?: boolean;
  onInstall?: () => void;
  onRun?: () => void;
  className?: string;
}

export function ToolCard({
  name,
  description,
  icon,
  category,
  credits,
  installed,
  onInstall,
  onRun,
  className,
}: ToolCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      className={cn(
        "group relative rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl transition-colors hover:border-indigo-500/30",
        className
      )}
    >
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
          {icon || <Wrench className="h-5 w-5" />}
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-white">{name}</h4>
          {category && (
            <span className="text-xs text-white/40">{category}</span>
          )}
        </div>
        {credits !== undefined && (
          <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-400">
            {credits} credits
          </span>
        )}
      </div>
      <p className="mb-4 text-sm leading-relaxed text-white/60">{description}</p>
      <div className="flex gap-2">
        {!installed && onInstall && (
          <button
            onClick={onInstall}
            className="rounded-lg border border-white/20 px-3 py-1.5 text-xs text-white/70 transition-colors hover:bg-white/10"
          >
            Install
          </button>
        )}
        {installed && onRun && (
          <button
            onClick={onRun}
            className="rounded-lg bg-indigo-500/80 px-3 py-1.5 text-xs text-white transition-colors hover:bg-indigo-500"
          >
            Run
          </button>
        )}
      </div>
    </motion.div>
  );
}
