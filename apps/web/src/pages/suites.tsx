import { motion } from "framer-motion";
import { Package } from "lucide-react";

const sampleSuites = [
  { id: "1", name: "Student Suite", description: "Complete set of AI tools for academic work — essays, research, citations, and study aids", toolCount: 8, price: "Free" },
  { id: "2", name: "Creator Suite", description: "Content creation powerhouse — blog posts, social media, images, and video scripts", toolCount: 12, price: "$9.99/mo" },
  { id: "3", name: "Developer Suite", description: "Code generation, documentation, testing, and DevOps automation tools", toolCount: 10, price: "$14.99/mo" },
  { id: "4", name: "Marketing Suite", description: "SEO, email campaigns, ad copy, analytics, and customer engagement tools", toolCount: 15, price: "$19.99/mo" },
];

export function SuitesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Suites</h1>
        <p className="mt-1 text-sm text-white/50">Pre-built tool collections for every use case</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {sampleSuites.map((suite, i) => (
          <motion.div
            key={suite.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition-colors hover:border-violet-500/30"
          >
            <div className="absolute right-0 top-0 h-32 w-32 bg-gradient-to-bl from-violet-500/10 to-transparent" />
            <div className="relative">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/20 text-violet-400">
                  <Package className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-white">{suite.name}</h4>
                  <span className="text-xs text-white/40">{suite.toolCount} tools</span>
                </div>
              </div>
              <p className="mb-4 text-sm leading-relaxed text-white/60">{suite.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white/80">{suite.price}</span>
                <button className="rounded-lg bg-violet-500/80 px-4 py-1.5 text-xs text-white transition-colors hover:bg-violet-500">
                  Install Suite
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
