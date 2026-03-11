import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Wrench, Package, Bot, GitBranch, Zap, TrendingUp, Loader2 } from "lucide-react";
import { HeroView1 } from "../components/hero-view1";
import { HeroView2 } from "../components/hero-view2";
import { api } from "../lib/api";

export function DashboardPage() {
  const [heroView, setHeroView] = useState<"view1" | "view2">("view1");
  const [counts, setCounts] = useState({ tools: 0, suites: 0, agents: 0, workflows: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.settings.get().then((res) => {
      if (res.data.heroView === "view1" || res.data.heroView === "view2") {
        setHeroView(res.data.heroView);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    Promise.all([
      api.tools.list().then((r) => r.data.length).catch(() => 0),
      api.suites.list().then((r) => r.data.length).catch(() => 0),
      api.agents.list().then((r) => r.data.length).catch(() => 0),
      api.workflows.list().then((r) => r.data.length).catch(() => 0),
    ]).then(([tools, suites, agents, workflows]) => {
      setCounts({ tools, suites, agents, workflows });
    }).finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: "Tools", value: counts.tools, icon: Wrench, color: "text-a-text bg-a-bg" },
    { label: "Suites", value: counts.suites, icon: Package, color: "text-a-violet-text bg-a-violet-bg" },
    { label: "Agents", value: counts.agents, icon: Bot, color: "text-a-cyan-text bg-a-cyan-bg" },
    { label: "Workflows", value: counts.workflows, icon: GitBranch, color: "text-a-emerald-text bg-a-emerald-bg" },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      {heroView === "view1" ? <HeroView1 /> : <HeroView2 />}

      <div>
        <h1 className="text-2xl font-bold text-t-primary">Dashboard</h1>
        <p className="mt-1 text-sm text-t-secondary">
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
            className="rounded-2xl border border-border bg-card p-5 backdrop-blur-xl"
          >
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-bold text-t-primary">
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : stat.value}
                </div>
                <div className="text-xs text-t-muted">{stat.label}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Recent Activity — placeholder until activity log is implemented */}
        <div className="rounded-2xl border border-border bg-card p-6 backdrop-blur-xl">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-t-primary">
            <TrendingUp className="h-5 w-5 text-a-text" />
            Recent Activity
          </h3>
          <p className="text-sm text-t-muted">No recent activity yet. Run a tool to get started.</p>
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl border border-border bg-card p-6 backdrop-blur-xl">
          <h3 className="mb-4 text-lg font-semibold text-t-primary">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Run a Tool", icon: Wrench, color: "from-indigo-500 to-violet-500" },
              { label: "Create Workflow", icon: GitBranch, color: "from-emerald-500 to-cyan-500" },
              { label: "Launch Agent", icon: Bot, color: "from-cyan-500 to-blue-500" },
              { label: "Browse Marketplace", icon: Package, color: "from-violet-500 to-fuchsia-500" },
            ].map((action) => (
              <button
                key={action.label}
                className="flex items-center gap-3 rounded-xl border border-border p-4 text-left transition-all hover:border-border-hover hover:bg-hover"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${action.color}`}>
                  <action.icon className="h-5 w-5 text-white" />
                </div>
                <span className="text-sm font-medium text-t-secondary">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
