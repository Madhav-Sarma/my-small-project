import React from "react";
import { cn } from "@aios/design-system";

interface GradientBackgroundProps {
  className?: string;
  children: React.ReactNode;
}

export function GradientBackground({ className, children }: GradientBackgroundProps) {
  return (
    <div
      className={cn(
        "relative min-h-screen overflow-hidden bg-[#0a0a1a]",
        className
      )}
    >
      {/* Neural mesh gradient layers */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[20%] top-[10%] h-[500px] w-[500px] rounded-full bg-indigo-900/20 blur-[120px]" />
        <div className="absolute right-[10%] top-[30%] h-[400px] w-[400px] rounded-full bg-violet-900/20 blur-[100px]" />
        <div className="absolute bottom-[20%] left-[30%] h-[600px] w-[600px] rounded-full bg-cyan-900/10 blur-[140px]" />
      </div>
      {/* Grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
