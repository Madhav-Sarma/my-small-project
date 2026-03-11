import { motion } from "framer-motion";
import { Wrench, Package, Bot, GitBranch, Zap, TrendingUp } from "lucide-react";

const stats = [
  { label: "Tools Installed", value: "24", icon: Wrench, color: "text-indigo-400 bg-indigo-500/20" },
  { label: "Active Suites", value: "6", icon: Package, color: "text-violet-400 bg-violet-500/20" },
  { label: "Agents Running", value: "3", icon: Bot, color: "text-cyan-400 bg-cyan-500/20" },
  { label: "Workflows", value: "12", icon: GitBranch, color: "text-emerald-400 bg-emerald-500/20" },
];

const recentActivity = [
  { action: "Blog Generator executed", time: "2 min ago", icon: Zap },
  { action: "SEO Optimizer installed", time: "15 min ago", icon: Wrench },
  { action: "Research Agent completed", time: "1 hour ago", icon: Bot },
  { action: "Content workflow triggered", time: "3 hours ago", icon: GitBranch },
];

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-white/50">
          Welcome back. Here&apos;s your workspace overview.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl"
          >
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-white/40">{stat.label}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
            <TrendingUp className="h-5 w-5 text-indigo-400" />
            Recent Activity
          </h3>
          <div className="space-y-3">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-white/5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                  <item.icon className="h-4 w-4 text-white/60" />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-white/80">{item.action}</div>
                  <div className="text-xs text-white/30">{item.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <h3 className="mb-4 text-lg font-semibold text-white">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Run a Tool", icon: Wrench, color: "from-indigo-500 to-violet-500" },
              { label: "Create Workflow", icon: GitBranch, color: "from-emerald-500 to-cyan-500" },
              { label: "Launch Agent", icon: Bot, color: "from-cyan-500 to-blue-500" },
              { label: "Browse Marketplace", icon: Package, color: "from-violet-500 to-fuchsia-500" },
            ].map((action) => (
              <button
                key={action.label}
                className="flex items-center gap-3 rounded-xl border border-white/10 p-4 text-left transition-all hover:border-white/20 hover:bg-white/5"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${action.color}`}>
                  <action.icon className="h-5 w-5 text-white" />
                </div>
                <span className="text-sm font-medium text-white/80">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
