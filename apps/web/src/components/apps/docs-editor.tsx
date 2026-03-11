import { Bold, Italic, Underline, List, Heading1, Heading2, AlignLeft, Sparkles } from "lucide-react";

export function DocsEditor() {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/5">
      {/* Toolbar */}
      <div className="flex items-center gap-1 border-b border-white/10 px-4 py-2">
        {[Bold, Italic, Underline].map((Icon, i) => (
          <button key={i} className="rounded-lg p-2 text-white/50 hover:bg-white/10 hover:text-white">
            <Icon className="h-4 w-4" />
          </button>
        ))}
        <div className="mx-1 h-5 w-px bg-white/10" />
        {[Heading1, Heading2].map((Icon, i) => (
          <button key={i} className="rounded-lg p-2 text-white/50 hover:bg-white/10 hover:text-white">
            <Icon className="h-4 w-4" />
          </button>
        ))}
        <div className="mx-1 h-5 w-px bg-white/10" />
        {[AlignLeft, List].map((Icon, i) => (
          <button key={i} className="rounded-lg p-2 text-white/50 hover:bg-white/10 hover:text-white">
            <Icon className="h-4 w-4" />
          </button>
        ))}
        <div className="flex-1" />
        <button className="flex items-center gap-1.5 rounded-lg bg-indigo-500/20 px-3 py-1.5 text-xs text-indigo-400 hover:bg-indigo-500/30">
          <Sparkles className="h-3 w-3" /> AI Assist
        </button>
      </div>

      {/* Editor area — TipTap would mount here */}
      <div className="flex-1 p-8">
        <div className="mx-auto max-w-2xl">
          <h1
            className="mb-4 text-3xl font-bold text-white outline-none"
            contentEditable
            suppressContentEditableWarning
          >
            Untitled Document
          </h1>
          <p
            className="text-base leading-relaxed text-white/60 outline-none"
            contentEditable
            suppressContentEditableWarning
          >
            Start writing here... Use the AI Assist button to generate, improve, or translate content.
          </p>
        </div>
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between border-t border-white/10 px-4 py-1.5 text-[11px] text-white/30">
        <span>Words: 12</span>
        <span>Saved</span>
      </div>
    </div>
  );
}
