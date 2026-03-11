import { motion } from "framer-motion";
import { Store, Star, Download } from "lucide-react";

const listings = [
  { id: "1", name: "PDF Analyzer Pro", type: "Tool", rating: 4.8, downloads: 12500, price: "Free", description: "Extract, analyze, and summarize PDF documents" },
  { id: "2", name: "Social Media Suite", type: "Suite", rating: 4.6, downloads: 8200, price: "$4.99/mo", description: "Complete social media management toolkit" },
  { id: "3", name: "Data Scientist Pack", type: "Agent Pack", rating: 4.9, downloads: 5600, price: "$12.99/mo", description: "Agents for data analysis, visualization, and ML" },
  { id: "4", name: "Slack Connector", type: "Connector", rating: 4.7, downloads: 22000, price: "Free", description: "Integrate your workspace with Slack channels" },
  { id: "5", name: "Translation Tool", type: "Tool", rating: 4.5, downloads: 18300, price: "2 credits", description: "Translate content between 100+ languages" },
  { id: "6", name: "Notion Sync", type: "Connector", rating: 4.4, downloads: 15200, price: "Free", description: "Two-way sync with your Notion workspace" },
];

export function MarketplacePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Marketplace</h1>
        <p className="mt-1 text-sm text-white/50">Discover tools, suites, agents, and connectors</p>
      </div>

      {/* Categories */}
      <div className="flex gap-2">
        {["All", "Tools", "Suites", "Agent Packs", "Connectors", "Apps"].map((cat) => (
          <button
            key={cat}
            className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
              cat === "All"
                ? "bg-indigo-500/20 text-indigo-400"
                : "text-white/50 hover:bg-white/5 hover:text-white/80"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {listings.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl transition-colors hover:border-indigo-500/20"
          >
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
                <Store className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-white">{item.name}</h4>
                <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-white/50">
                  {item.type}
                </span>
              </div>
            </div>
            <p className="mb-3 text-sm text-white/60">{item.description}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-xs text-amber-400">
                  <Star className="h-3 w-3 fill-current" /> {item.rating}
                </div>
                <div className="flex items-center gap-1 text-xs text-white/40">
                  <Download className="h-3 w-3" /> {item.downloads.toLocaleString()}
                </div>
              </div>
              <span className="text-xs font-medium text-white/70">{item.price}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
