import { FileCode, Play, FolderTree, Sparkles } from "lucide-react";

const sampleFiles = [
  { name: "index.ts", active: true },
  { name: "utils.ts", active: false },
  { name: "types.ts", active: false },
];

export function CodeIDE() {
  return (
    <div className="flex h-full rounded-2xl border border-border bg-card">
      {/* File tree */}
      <div className="w-56 border-r border-border p-3">
        <div className="mb-2 flex items-center gap-2 px-2 text-xs font-medium text-t-muted">
          <FolderTree className="h-3 w-3" /> FILES
        </div>
        {sampleFiles.map((file) => (
          <button
            key={file.name}
            className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm ${
              file.active
                ? "bg-a-bg text-a-text"
                : "text-t-muted hover:bg-hover"
            }`}
          >
            <FileCode className="h-3.5 w-3.5" />
            {file.name}
          </button>
        ))}
      </div>

      {/* Editor area — Monaco would mount here */}
      <div className="flex flex-1 flex-col">
        {/* Tabs */}
        <div className="flex border-b border-border">
          <div className="flex items-center gap-2 border-r border-border bg-card px-4 py-2 text-xs text-t-secondary">
            <FileCode className="h-3 w-3" /> index.ts
          </div>
        </div>

        {/* Code content placeholder */}
        <div className="flex-1 overflow-auto p-4 font-mono text-sm">
          <div className="space-y-1">
            <div><span className="text-violet-400">import</span> <span className="text-emerald-400">{`{ serve }`}</span> <span className="text-violet-400">from</span> <span className="text-amber-300">"./server"</span><span className="text-white/50">;</span></div>
            <div />
            <div><span className="text-violet-400">const</span> <span className="text-cyan-400">app</span> <span className="text-white/50">=</span> <span className="text-yellow-400">serve</span><span className="text-white/50">({"{"}</span></div>
            <div><span className="text-white/30">  </span><span className="text-white/70">port</span><span className="text-white/50">:</span> <span className="text-amber-300">3000</span><span className="text-white/50">,</span></div>
            <div><span className="text-white/50">{"}"})</span><span className="text-white/50">;</span></div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between border-t border-border px-4 py-1.5">
          <div className="flex items-center gap-2 text-[11px] text-t-muted">
            <span>TypeScript</span>
            <span>UTF-8</span>
            <span>Ln 1, Col 1</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1 rounded px-2 py-1 text-[11px] text-indigo-400 hover:bg-indigo-500/10">
              <Sparkles className="h-3 w-3" /> AI Complete
            </button>
            <button className="flex items-center gap-1 rounded bg-emerald-500/20 px-2 py-1 text-[11px] text-emerald-400 hover:bg-emerald-500/30">
              <Play className="h-3 w-3" /> Run
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
