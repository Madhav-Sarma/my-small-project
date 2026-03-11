import { Search, Bell, Plus } from "lucide-react";

export function TopBar() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-white/10 px-6">
      {/* Search */}
      <div className="flex w-96 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
        <Search className="h-4 w-4 text-white/40" />
        <input
          type="text"
          placeholder="Search tools, suites, agents..."
          className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none"
        />
        <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-white/30">
          ⌘K
        </kbd>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button className="flex h-9 w-9 items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-white/10 hover:text-white">
          <Bell className="h-4 w-4" />
        </button>
        <button className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700">
          <Plus className="h-4 w-4" />
          New
        </button>
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500" />
      </div>
    </header>
  );
}
