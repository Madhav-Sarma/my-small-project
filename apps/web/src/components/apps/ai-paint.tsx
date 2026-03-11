import { Paintbrush, Square, Circle, Type, Sparkles, Download, Undo, Redo } from "lucide-react";

const tools = [
  { icon: Paintbrush, label: "Brush" },
  { icon: Square, label: "Rectangle" },
  { icon: Circle, label: "Ellipse" },
  { icon: Type, label: "Text" },
];

export function AIPaint() {
  return (
    <div className="flex h-full rounded-2xl border border-white/10 bg-white/5">
      {/* Tools panel */}
      <div className="flex w-14 flex-col items-center gap-1 border-r border-white/10 py-3">
        {tools.map(({ icon: Icon, label }) => (
          <button
            key={label}
            title={label}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-white/50 hover:bg-white/10 hover:text-white"
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}
        <div className="mx-auto my-2 h-px w-6 bg-white/10" />
        <button title="Undo" className="flex h-10 w-10 items-center justify-center rounded-lg text-white/50 hover:bg-white/10">
          <Undo className="h-4 w-4" />
        </button>
        <button title="Redo" className="flex h-10 w-10 items-center justify-center rounded-lg text-white/50 hover:bg-white/10">
          <Redo className="h-4 w-4" />
        </button>
      </div>

      {/* Canvas area — Excalidraw would mount here */}
      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
          <span className="text-sm text-white/60">Canvas — 1920 × 1080</span>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 rounded-lg bg-fuchsia-500/20 px-3 py-1.5 text-xs text-fuchsia-400 hover:bg-fuchsia-500/30">
              <Sparkles className="h-3 w-3" /> AI Generate
            </button>
            <button className="flex items-center gap-1.5 rounded-lg border border-white/20 px-3 py-1.5 text-xs text-white/60 hover:bg-white/10">
              <Download className="h-3 w-3" /> Export
            </button>
          </div>
        </div>

        {/* Canvas placeholder */}
        <div className="flex flex-1 items-center justify-center bg-[#1a1a2e]">
          <div className="text-center text-white/20">
            <Paintbrush className="mx-auto mb-3 h-12 w-12" />
            <p className="text-sm">Select a tool and start drawing</p>
            <p className="mt-1 text-xs text-white/10">or use AI Generate to create from a prompt</p>
          </div>
        </div>
      </div>
    </div>
  );
}
