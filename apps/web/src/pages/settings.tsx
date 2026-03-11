import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Eye, CreditCard, User, Building2, Loader2, Sun, Moon, Palette } from "lucide-react";
import { api } from "../lib/api";
import { useAppStore } from "../store/app-store";

export function SettingsPage() {
  const [heroView, setHeroView] = useState<"view1" | "view2">("view1");
  const [saving, setSaving] = useState(false);
  const userProfile = useAppStore((s) => s.userProfile);
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    api.settings.get().then((res) => {
      if (res.data.heroView === "view1" || res.data.heroView === "view2") {
        setHeroView(res.data.heroView);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!userProfile?.organizationId) return;
    api.billing.getWallet(userProfile.organizationId).then((res) => {
      setCredits(res.data.balance);
    }).catch(() => {});
  }, [userProfile?.organizationId]);

  async function saveHeroView(view: "view1" | "view2") {
    setHeroView(view);
    setSaving(true);
    try {
      await api.settings.update({ heroView: view });
    } catch {
      // silently fail
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-t-primary">Settings</h1>
        <p className="mt-1 text-sm text-t-secondary">Manage your workspace and account settings</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Theme Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
          className="col-span-2 rounded-2xl border border-border bg-card p-6"
        >
          <h3 className="mb-1 flex items-center gap-2 text-lg font-semibold text-t-primary">
            <Palette className="h-5 w-5 text-a-text" />
            Appearance
          </h3>
          <p className="mb-4 text-sm text-t-muted">Choose your preferred color theme</p>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setTheme("light")}
              className={`relative flex items-center gap-4 overflow-hidden rounded-xl border-2 p-4 transition-all ${
                theme === "light"
                  ? "border-indigo-500 bg-indigo-500/10"
                  : "border-border bg-card hover:border-border-hover"
              }`}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                <Sun className="h-6 w-6" />
              </div>
              <div className="text-left">
                <span className="text-sm font-medium text-t-primary">Light</span>
                <p className="text-xs text-t-muted">Clean white aesthetic</p>
              </div>
              {theme === "light" && (
                <div className="absolute right-2 top-2 rounded-full bg-indigo-500 px-2 py-0.5 text-[10px] font-medium text-white">
                  Active
                </div>
              )}
            </button>

            <button
              onClick={() => setTheme("dark")}
              className={`relative flex items-center gap-4 overflow-hidden rounded-xl border-2 p-4 transition-all ${
                theme === "dark"
                  ? "border-indigo-500 bg-indigo-500/10"
                  : "border-border bg-card hover:border-border-hover"
              }`}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
                <Moon className="h-6 w-6" />
              </div>
              <div className="text-left">
                <span className="text-sm font-medium text-t-primary">Dark</span>
                <p className="text-xs text-t-muted">Glassmorphism dark mode</p>
              </div>
              {theme === "dark" && (
                <div className="absolute right-2 top-2 rounded-full bg-indigo-500 px-2 py-0.5 text-[10px] font-medium text-white">
                  Active
                </div>
              )}
            </button>
          </div>
        </motion.div>

        {/* Hero View Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="col-span-2 rounded-2xl border border-border bg-card p-6"
        >
          <h3 className="mb-1 flex items-center gap-2 text-lg font-semibold text-t-primary">
            <Eye className="h-5 w-5 text-a-text" />
            Hero View
            {saving && <Loader2 className="h-4 w-4 animate-spin text-t-muted" />}
          </h3>
          <p className="mb-4 text-sm text-t-muted">Choose the landing hero style for your dashboard</p>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => saveHeroView("view1")}
              className={`relative overflow-hidden rounded-xl border-2 p-4 transition-all ${
                heroView === "view1"
                  ? "border-indigo-500 bg-indigo-500/10"
                  : "border-border bg-card hover:border-border-hover"
              }`}
            >
              <div className="mb-3 flex aspect-video w-full flex-col items-center justify-end rounded-lg bg-gradient-to-b from-sky-200/40 to-white p-3">
                <div className="h-2 w-20 rounded bg-black/20" />
                <div className="mt-1 h-1.5 w-28 rounded bg-black/10" />
                <div className="mt-2 h-5 w-24 rounded-full bg-black/15" />
              </div>
              <div className="text-left">
                <span className="text-sm font-medium text-t-primary">Remote Team</span>
                <p className="text-xs text-t-muted">Video bg, centered text, email CTA</p>
              </div>
              {heroView === "view1" && (
                <div className="absolute right-2 top-2 rounded-full bg-indigo-500 px-2 py-0.5 text-[10px] font-medium text-white">
                  Active
                </div>
              )}
            </button>

            <button
              onClick={() => saveHeroView("view2")}
              className={`relative overflow-hidden rounded-xl border-2 p-4 transition-all ${
                heroView === "view2"
                  ? "border-indigo-500 bg-indigo-500/10"
                  : "border-border bg-card hover:border-border-hover"
              }`}
            >
              <div className="mb-3 flex aspect-video w-full flex-col items-center justify-center rounded-lg bg-gradient-to-b from-gray-700 to-gray-900 p-3">
                <div className="mb-1 h-1 w-16 rounded bg-white/40" />
                <div className="h-2 w-24 rounded bg-white/25" />
                <div className="mt-1 h-1.5 w-20 rounded bg-white/15" />
                <div className="mt-2 h-5 w-20 rounded-full bg-white/20" />
              </div>
              <div className="text-left">
                <span className="text-sm font-medium text-t-primary">Logoisum Agency</span>
                <p className="text-xs text-t-muted">Full video bg, floating nav, bold type</p>
              </div>
              {heroView === "view2" && (
                <div className="absolute right-2 top-2 rounded-full bg-indigo-500 px-2 py-0.5 text-[10px] font-medium text-white">
                  Active
                </div>
              )}
            </button>
          </div>
        </motion.div>

        {/* Profile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-border bg-card p-6"
        >
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-t-primary">
            <User className="h-5 w-5 text-a-text" />
            Profile
          </h3>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm text-t-secondary">Display Name</label>
              <input className="w-full rounded-lg border border-border-hover bg-input px-3 py-2 text-sm text-input-text focus:outline-none focus:ring-2 focus:ring-indigo-500" defaultValue={userProfile?.name ?? ""} />
            </div>
            <div>
              <label className="mb-1 block text-sm text-t-secondary">Email</label>
              <input className="w-full rounded-lg border border-border-hover bg-input px-3 py-2 text-sm text-input-text focus:outline-none focus:ring-2 focus:ring-indigo-500" defaultValue={userProfile?.email ?? ""} readOnly />
            </div>
          </div>
        </motion.div>

        {/* Billing */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl border border-border bg-card p-6"
        >
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-t-primary">
            <CreditCard className="h-5 w-5 text-a-text" />
            Billing
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-t-secondary">Current Plan</span>
              <span className="rounded-full bg-a-bg px-2.5 py-0.5 text-xs font-medium text-a-text">Active</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-t-secondary">Credits</span>
              <span className="text-sm font-medium text-t-primary">{credits !== null ? credits.toLocaleString() : "—"}</span>
            </div>
            <button className="w-full rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700">
              Buy Credits
            </button>
          </div>
        </motion.div>

        {/* Workspace */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-border bg-card p-6"
        >
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-t-primary">
            <Building2 className="h-5 w-5 text-a-text" />
            Workspace
          </h3>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm text-t-secondary">Workspace Name</label>
              <input className="w-full rounded-lg border border-border-hover bg-input px-3 py-2 text-sm text-input-text focus:outline-none focus:ring-2 focus:ring-indigo-500" defaultValue="My Workspace" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-t-secondary">Members</span>
              <span className="text-sm text-t-primary">3</span>
            </div>
          </div>
        </motion.div>

        {/* API Keys */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-2xl border border-border bg-card p-6"
        >
          <h3 className="mb-4 text-lg font-semibold text-t-primary">API Keys</h3>
          <div className="space-y-3">
            {["OpenAI", "Anthropic", "Google AI"].map((provider) => (
              <div key={provider} className="flex items-center justify-between rounded-xl bg-hover p-3">
                <span className="text-sm text-t-secondary">{provider}</span>
                <button className="rounded-lg border border-border-hover px-3 py-1 text-xs text-t-muted hover:bg-card-hover">
                  Configure
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
