import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Store, Star, Download, Loader2 } from "lucide-react";
import { api } from "../lib/api";

interface MarketplaceItem {
  id: string;
  title: string;
  description: string | null;
  itemType: string;
  category: string | null;
  averageRating: number | null;
  totalInstalls: number;
  price: string | null;
}

export function MarketplacePage() {
  const [listings, setListings] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const params: Record<string, string> = {};
    if (filter !== "All") params.itemType = filter.toLowerCase().replace(/ /g, "_");
    api.marketplace.list(params)
      .then((res) => setListings(res.data as MarketplaceItem[]))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-t-primary">Marketplace</h1>
        <p className="mt-1 text-sm text-t-secondary">Discover tools, suites, agents, and connectors</p>
      </div>

      {/* Categories */}
      <div className="flex gap-2">
        {["All", "Tools", "Suites", "Agent Packs", "Connectors", "Apps"].map((cat) => (
          <button
            key={cat}
            onClick={() => { setFilter(cat); setLoading(true); }}
            className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
              filter === cat
                ? "bg-a-bg text-a-text"
                : "text-t-muted hover:bg-hover hover:text-t-primary"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-t-muted">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading marketplace…
        </div>
      ) : listings.length === 0 ? (
        <div className="py-20 text-center text-t-muted">No marketplace listings yet.</div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {listings.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="rounded-2xl border border-border bg-card p-5 backdrop-blur-xl transition-colors hover:border-a-text/20"
            >
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-a-bg text-a-text">
                  <Store className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-t-primary">{item.title}</h4>
                  <span className="rounded bg-hover px-1.5 py-0.5 text-[10px] text-t-muted">
                    {item.itemType}
                  </span>
                </div>
              </div>
              <p className="mb-3 text-sm text-t-secondary">{item.description ?? ""}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {item.averageRating != null && (
                    <div className="flex items-center gap-1 text-xs text-amber-400">
                      <Star className="h-3 w-3 fill-current" /> {item.averageRating.toFixed(1)}
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-xs text-t-muted">
                    <Download className="h-3 w-3" /> {item.totalInstalls.toLocaleString()}
                  </div>
                </div>
                <span className="text-xs font-medium text-t-secondary">{item.price ?? "Free"}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
