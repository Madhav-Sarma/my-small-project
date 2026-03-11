import { Search, Bell, Plus } from "lucide-react";

export function TopBar() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-page px-6">
      {/* Search */}
      <div className="flex w-96 items-center gap-2 rounded-xl border border-border bg-input px-3 py-2">
        <Search className="h-4 w-4 text-t-muted" />
        <input
          type="text"
          placeholder="Search tools, suites, agents..."
          className="flex-1 bg-transparent text-sm text-input-text placeholder:text-input-placeholder focus:outline-none"
        />
        <kbd className="rounded px-1.5 py-0.5 text-[10px]" style={{ background: 'var(--kbd-bg)', color: 'var(--kbd-text)' }}>
          ⌘K
        </kbd>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button className="flex h-9 w-9 items-center justify-center rounded-lg text-t-secondary transition-colors hover:bg-hover hover:text-t-primary">
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
