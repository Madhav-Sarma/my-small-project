export function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="mt-1 text-sm text-white/50">Manage your workspace and account settings</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Profile */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">Profile</h3>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm text-white/50">Display Name</label>
              <input className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" defaultValue="User" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-white/50">Email</label>
              <input className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" defaultValue="user@example.com" />
            </div>
          </div>
        </div>

        {/* API Keys */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">API Keys</h3>
          <div className="space-y-3">
            {["OpenAI", "Anthropic", "Google AI"].map((provider) => (
              <div key={provider} className="flex items-center justify-between rounded-xl bg-white/5 p-3">
                <span className="text-sm text-white/70">{provider}</span>
                <button className="rounded-lg border border-white/20 px-3 py-1 text-xs text-white/50 hover:bg-white/10">
                  Configure
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Billing */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">Billing</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/50">Current Plan</span>
              <span className="rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-xs font-medium text-indigo-400">Pro</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/50">Credits</span>
              <span className="text-sm font-medium text-white">2,450</span>
            </div>
            <button className="w-full rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700">
              Manage Subscription
            </button>
          </div>
        </div>

        {/* Workspace */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">Workspace</h3>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm text-white/50">Workspace Name</label>
              <input className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" defaultValue="My Workspace" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/50">Members</span>
              <span className="text-sm text-white">3</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
