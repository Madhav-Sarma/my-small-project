import { TerminalSquare } from "lucide-react";

export function TerminalApp() {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-border bg-[#0c0c1e] dark:bg-[#0c0c1e]">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border px-4 py-2">
        <TerminalSquare className="h-4 w-4 text-emerald-400" />
        <span className="text-sm text-white/60">Terminal</span>
        <div className="flex-1" />
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-red-500/60" />
          <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
          <div className="h-3 w-3 rounded-full bg-emerald-500/60" />
        </div>
      </div>

      {/* Terminal output */}
      <div className="flex-1 overflow-auto p-4 font-mono text-sm">
        <div className="space-y-1 text-white/60">
          <div><span className="text-emerald-400">aios@workspace</span><span className="text-white/30">:</span><span className="text-cyan-400">~</span><span className="text-white/30">$</span> <span className="text-white/70">echo "Welcome to AIOS Terminal"</span></div>
          <div className="text-white/50">Welcome to AIOS Terminal</div>
          <div><span className="text-emerald-400">aios@workspace</span><span className="text-white/30">:</span><span className="text-cyan-400">~</span><span className="text-white/30">$</span> <span className="text-white/70">aios tools list</span></div>
          <div className="text-white/40">┌─────────────────┬──────────┬─────────┐</div>
          <div className="text-white/40">│ Name            │ Status   │ Credits │</div>
          <div className="text-white/40">├─────────────────┼──────────┼─────────┤</div>
          <div className="text-white/40">│ blog-generator  │ active   │ 5       │</div>
          <div className="text-white/40">│ code-generator  │ active   │ 8       │</div>
          <div className="text-white/40">│ image-generator │ active   │ 10      │</div>
          <div className="text-white/40">└─────────────────┴──────────┴─────────┘</div>
          <div className="mt-2"><span className="text-emerald-400">aios@workspace</span><span className="text-white/30">:</span><span className="text-cyan-400">~</span><span className="text-white/30">$</span> <span className="animate-pulse text-white/80">▊</span></div>
        </div>
      </div>

      {/* Input */}
      <div className="flex items-center border-t border-border px-4 py-2">
        <span className="mr-2 text-sm text-emerald-400">$</span>
        <input
          type="text"
          className="flex-1 bg-transparent font-mono text-sm text-white/80 placeholder:text-white/20 focus:outline-none"
          placeholder="Type a command..."
        />
      </div>
    </div>
  );
}
