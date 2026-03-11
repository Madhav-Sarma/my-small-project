import { motion } from "framer-motion";
import { AppWindow } from "lucide-react";

const builtInApps = [
  { id: "docs", name: "Docs Editor", description: "Rich text editor with AI-powered writing assistance", icon: "📝", color: "from-blue-500 to-cyan-500", installed: true },
  { id: "ide", name: "Code IDE", description: "Full-featured code editor with AI completion", icon: "💻", color: "from-emerald-500 to-green-500", installed: true },
  { id: "paint", name: "AI Paint", description: "Image editing and generation canvas", icon: "🎨", color: "from-fuchsia-500 to-pink-500", installed: true },
  { id: "terminal", name: "Terminal", description: "Command-line interface with AI assistance", icon: "⌨️", color: "from-gray-500 to-zinc-500", installed: true },
];

export function AppsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Apps</h1>
        <p className="mt-1 text-sm text-white/50">Built-in and installed applications</p>
      </div>

      <h3 className="text-sm font-medium text-white/40">BUILT-IN APPS</h3>
      <div className="grid grid-cols-4 gap-4">
        {builtInApps.map((app, i) => (
          <motion.div
            key={app.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="group cursor-pointer rounded-2xl border border-white/10 bg-white/5 p-5 text-center backdrop-blur-xl transition-all hover:border-white/20 hover:bg-white/[0.08]"
          >
            <div className={`mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${app.color} text-2xl`}>
              {app.icon}
            </div>
            <h4 className="font-semibold text-white">{app.name}</h4>
            <p className="mt-1 text-xs text-white/50">{app.description}</p>
            <button className="mt-3 rounded-lg bg-white/10 px-3 py-1 text-xs text-white/70 transition-colors hover:bg-white/20">
              Open
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
