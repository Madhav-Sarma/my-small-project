import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Wrench,
  Package,
  Bot,
  GitBranch,
  Store,
  AppWindow,
  Settings,
} from "lucide-react";
import { api } from "../lib/api";
import { useAppStore } from "../store/app-store";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/tools", icon: Wrench, label: "Tools" },
  { to: "/suites", icon: Package, label: "Suites" },
  { to: "/agents", icon: Bot, label: "Agents" },
  { to: "/workflows", icon: GitBranch, label: "Workflows" },
  { to: "/marketplace", icon: Store, label: "Marketplace" },
  { to: "/apps", icon: AppWindow, label: "Apps" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export function Sidebar() {
  const orgId = useAppStore((s) => s.userProfile?.organizationId);
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    if (!orgId) return;
    api.billing.getWallet(orgId).then((res) => {
      setCredits(res.data.balance);
    }).catch(() => {});
  }, [orgId]);

  return (
    <aside className="flex w-64 flex-col border-r border-border bg-page">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-border px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg neural-gradient">
          <span className="text-sm font-bold text-white">A</span>
        </div>
        <span className="text-lg font-bold text-gradient">AIOS</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? "bg-a-bg text-a-text"
                  : "text-t-muted hover:bg-hover hover:text-t-primary"
              }`
            }
          >
            <Icon className="h-4.5 w-4.5" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Credits */}
      <div className="m-3 rounded-xl border border-border bg-card p-4">
        <div className="mb-2 text-xs text-t-muted">Credits Remaining</div>
        <div className="text-xl font-bold text-t-primary">{credits !== null ? credits.toLocaleString() : "—"}</div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-hover">
          <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" style={{ width: credits !== null ? `${Math.min(100, (credits / 1000) * 100)}%` : "0%" }} />
        </div>
      </div>
    </aside>
  );
}
