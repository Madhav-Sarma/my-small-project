import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AppWindow, Loader2 } from "lucide-react";
import { api } from "../lib/api";

interface AppItem {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  appType: string;
  isBuiltIn: boolean;
}

const APP_ICONS: Record<string, string> = { docs: "📝", ide: "💻", paint: "🎨", terminal: "⌨️" };
const APP_COLORS: Record<string, string> = {
  docs: "from-blue-500 to-cyan-500",
  ide: "from-emerald-500 to-green-500",
  paint: "from-fuchsia-500 to-pink-500",
  terminal: "from-gray-500 to-zinc-500",
};

export function AppsPage() {
  const [apps, setApps] = useState<AppItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.apps.list()
      .then((res) => setApps(res.data as AppItem[]))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-t-primary">Apps</h1>
        <p className="mt-1 text-sm text-t-secondary">Built-in and installed applications</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-t-muted">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading apps…
        </div>
      ) : apps.length === 0 ? (
        <div className="py-20 text-center text-t-muted">No apps available.</div>
      ) : (
        <>
          <h3 className="text-sm font-medium text-t-muted">APPS</h3>
          <div className="grid grid-cols-4 gap-4">
            {apps.map((app, i) => {
              const icon = APP_ICONS[app.slug] ?? "📦";
              const color = APP_COLORS[app.slug] ?? "from-indigo-500 to-violet-500";
              return (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="group cursor-pointer rounded-2xl border border-border bg-card p-5 text-center backdrop-blur-xl transition-all hover:border-border-hover hover:bg-card-hover"
                >
                  <div className={`mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${color} text-2xl`}>
                    {icon}
                  </div>
                  <h4 className="font-semibold text-t-primary">{app.name}</h4>
                  <p className="mt-1 text-xs text-t-secondary">{app.description ?? ""}</p>
                  <button className="mt-3 rounded-lg bg-hover px-3 py-1 text-xs text-t-secondary transition-colors hover:bg-card-hover">
                    Open
                  </button>
                </motion.div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
