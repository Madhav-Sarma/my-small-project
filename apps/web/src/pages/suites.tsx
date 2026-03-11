import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Package, Loader2 } from "lucide-react";
import { api } from "../lib/api";

interface SuiteItem {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  tools?: { tool: { name: string } }[];
}

export function SuitesPage() {
  const [suites, setSuites] = useState<SuiteItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.suites.list()
      .then((res) => setSuites(res.data as SuiteItem[]))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-t-primary">Suites</h1>
        <p className="mt-1 text-sm text-t-secondary">Pre-built tool collections for every use case</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-t-muted">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading suites…
        </div>
      ) : suites.length === 0 ? (
        <div className="py-20 text-center text-t-muted">No suites available yet.</div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {suites.map((suite, i) => (
            <motion.div
              key={suite.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 backdrop-blur-xl transition-colors hover:border-a-violet-text/30"
            >
              <div className="absolute right-0 top-0 h-32 w-32 bg-gradient-to-bl from-violet-500/10 to-transparent" />
              <div className="relative">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-a-violet-bg text-a-violet-text">
                    <Package className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-t-primary">{suite.name}</h4>
                    <span className="text-xs text-t-muted">{suite.tools?.length ?? 0} tools</span>
                  </div>
                </div>
                <p className="mb-4 text-sm leading-relaxed text-t-secondary">{suite.description ?? ""}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-t-muted">{suite.category ?? "General"}</span>
                  <button className="rounded-lg bg-violet-500/80 px-4 py-1.5 text-xs text-white transition-colors hover:bg-violet-500">
                    Install Suite
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
