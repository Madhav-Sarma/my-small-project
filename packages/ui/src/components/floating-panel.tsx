import React from "react";
import { cn } from "@aios/design-system";
import { motion } from "framer-motion";

interface FloatingPanelProps {
  className?: string;
  title?: string;
  children: React.ReactNode;
}

export function FloatingPanel({ className, title, children }: FloatingPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        "rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-2xl",
        className
      )}
    >
      {title && (
        <h3 className="mb-4 text-lg font-semibold text-white/90">{title}</h3>
      )}
      {children}
    </motion.div>
  );
}
