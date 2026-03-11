import React from "react";
import { cn } from "@aios/design-system";
import { motion } from "framer-motion";
import { Package } from "lucide-react";

interface SuiteCardProps {
  name: string;
  description: string;
  toolCount: number;
  icon?: React.ReactNode;
  price?: string;
  installed?: boolean;
  onInstall?: () => void;
  className?: string;
}

export function SuiteCard({
  name,
  description,
  toolCount,
  icon,
  price,
  installed,
  onInstall,
  className,
}: SuiteCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl transition-colors hover:border-violet-500/30",
        className
      )}
    >
      <div className="absolute right-0 top-0 h-32 w-32 bg-gradient-to-bl from-violet-500/10 to-transparent" />
      <div className="relative">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/20 text-violet-400">
            {icon || <Package className="h-5 w-5" />}
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-white">{name}</h4>
            <span className="text-xs text-white/40">{toolCount} tools</span>
          </div>
        </div>
        <p className="mb-4 text-sm leading-relaxed text-white/60">{description}</p>
        <div className="flex items-center justify-between">
          {price && (
            <span className="text-sm font-medium text-white/80">{price}</span>
          )}
          {!installed && onInstall && (
            <button
              onClick={onInstall}
              className="rounded-lg bg-violet-500/80 px-3 py-1.5 text-xs text-white transition-colors hover:bg-violet-500"
            >
              Install Suite
            </button>
          )}
          {installed && (
            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-400">
              Installed
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
