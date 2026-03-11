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
  return (
    <aside className="flex w-64 flex-col border-r border-white/10 bg-white/[0.02]">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-white/10 px-6">
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
                  ? "bg-indigo-500/15 text-indigo-400"
                  : "text-white/50 hover:bg-white/5 hover:text-white/80"
              }`
            }
          >
            <Icon className="h-4.5 w-4.5" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Credits */}
      <div className="m-3 rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="mb-2 text-xs text-white/40">Credits Remaining</div>
        <div className="text-xl font-bold text-white">2,450</div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-[65%] rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" />
        </div>
      </div>
    </aside>
  );
}
