import { motion } from "framer-motion";
import { Wrench, Search, Filter } from "lucide-react";

const sampleTools = [
  { id: "1", name: "Blog Generator", description: "AI-powered blog post generation with SEO optimization", category: "Content", credits: 5 },
  { id: "2", name: "Code Generator", description: "Generate code snippets in multiple languages from natural language", category: "Development", credits: 8 },
  { id: "3", name: "Image Generator", description: "Create stunning AI-generated images from text prompts", category: "Creative", credits: 10 },
  { id: "4", name: "SEO Optimizer", description: "Analyze and optimize content for search engine rankings", category: "Marketing", credits: 3 },
  { id: "5", name: "Email Writer", description: "Craft professional emails with custom tone and style", category: "Communication", credits: 2 },
  { id: "6", name: "Essay Generator", description: "Generate well-structured academic essays on any topic", category: "Education", credits: 6 },
];

export function ToolsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Tools</h1>
          <p className="mt-1 text-sm text-white/50">Browse and manage your AI tools</p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
            <Search className="h-4 w-4 text-white/40" />
            <input type="text" placeholder="Search tools..." className="bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none" />
          </div>
          <button className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-white/60 hover:bg-white/5">
            <Filter className="h-4 w-4" /> Filter
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {sampleTools.map((tool, i) => (
          <motion.div
            key={tool.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="group rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl transition-colors hover:border-indigo-500/30"
          >
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
                <Wrench className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-white">{tool.name}</h4>
                <span className="text-xs text-white/40">{tool.category}</span>
              </div>
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-400">
                {tool.credits} credits
              </span>
            </div>
            <p className="mb-4 text-sm leading-relaxed text-white/60">{tool.description}</p>
            <div className="flex gap-2">
              <button className="rounded-lg bg-indigo-500/80 px-3 py-1.5 text-xs text-white transition-colors hover:bg-indigo-500">
                Run
              </button>
              <button className="rounded-lg border border-white/20 px-3 py-1.5 text-xs text-white/70 transition-colors hover:bg-white/10">
                Details
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
