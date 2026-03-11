import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wrench, Search, Filter, Loader2, X, PenTool, ChevronRight, CheckCircle, AlertCircle } from "lucide-react";
import { DocsEditor } from "../components/apps/docs-editor";
import { api, type ToolRunResult, type AIModel } from "../lib/api";

// ─── Tool type from API ──────────────────────────────────────────────────────
interface ToolItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  pricingCredits: number;
  handlerType: string;
}

// ─── Blog Generator drawer ────────────────────────────────────────────────────
interface BlogGeneratorPanelProps {
  onClose: () => void;
}

function BlogGeneratorPanel({ onClose }: BlogGeneratorPanelProps) {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState<"professional" | "casual" | "academic">("professional");
  const [length, setLength] = useState(800);
  const [selectedModelId, setSelectedModelId] = useState("");
  const [models, setModels] = useState<AIModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ToolRunResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.models.byCategory("text").then((res) => {
      setModels(res.data);
      if (res.data.length > 0) setSelectedModelId(res.data[0].id);
    }).catch(() => {});
  }, []);

  const generatedContent =
    result?.success && result.output?.type === "text_document"
      ? (result.output.data as { content?: string }).content ?? ""
      : "";

  async function handleRun() {
    if (!topic.trim() || !selectedModelId) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const resp = await api.tools.run({ toolId: "blog-generator", modelId: selectedModelId, inputs: { topic, tone, length } });
      setResult(resp.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      className="fixed inset-0 z-40 flex items-start justify-center bg-overlay p-6 pt-16 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="flex w-full max-w-5xl flex-col gap-4 rounded-2xl border border-border bg-panel p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
            <PenTool className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-t-primary">Blog Generator</h2>
            <p className="text-xs text-t-muted">AI-powered — 5 credits per run</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-t-muted hover:bg-hover hover:text-t-primary">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
          {/* ── Input form ── */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-t-secondary">Topic *</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. The future of AI in education"
                className="rounded-xl border border-border bg-input px-3 py-2.5 text-sm text-input-text placeholder:text-input-placeholder focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-t-secondary">Tone</label>
              <div className="flex gap-2">
                {(["professional", "casual", "academic"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTone(t)}
                    className={`flex-1 rounded-lg border px-3 py-2 text-xs capitalize transition-colors ${
                      tone === t
                        ? "border-indigo-500/50 bg-a-bg text-a-text"
                        : "border-border bg-card text-t-secondary hover:bg-hover"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-t-secondary">AI Model</label>
              <select
                value={selectedModelId}
                onChange={(e) => setSelectedModelId(e.target.value)}
                className="rounded-xl border border-border bg-input px-3 py-2.5 text-sm text-input-text focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
              >
                {models.map((m) => (
                  <option key={m.id} value={m.id} className="bg-panel">
                    {m.displayName} ({m.provider})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-t-secondary">Target Length — {length} words</label>
              <input
                type="range"
                min={200}
                max={2000}
                step={100}
                value={length}
                onChange={(e) => setLength(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
              <div className="flex justify-between text-[10px] text-t-muted">
                <span>200</span>
                <span>2000</span>
              </div>
            </div>

            <button
              onClick={handleRun}
              disabled={!topic.trim() || loading}
              className="mt-auto flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Generating…
                </>
              ) : (
                <>
                  <ChevronRight className="h-4 w-4" /> Generate Blog Post
                </>
              )}
            </button>

            {/* Status messages */}
            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-xs text-red-400">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                {error}
              </div>
            )}
            {result?.success && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2.5 text-xs text-emerald-400">
                <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                Done · {result.creditsCharged} credits · {result.output?.metadata.executionTimeMs}ms
              </div>
            )}
          </div>

          {/* ── TipTap output editor ── */}
          <div className="min-h-[420px]">
            {generatedContent || !loading ? (
              <DocsEditor content={generatedContent || undefined} />
            ) : (
              <div className="flex h-full items-center justify-center rounded-2xl border border-border bg-card text-sm text-t-muted">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating content…
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Tools page ───────────────────────────────────────────────────────────────
const ICON_MAP: Record<string, typeof Wrench> = {
  "text_generation": PenTool,
  "code_generation": Wrench,
  "image_generation": Wrench,
};

export function ToolsPage() {
  const [search, setSearch] = useState("");
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [tools, setTools] = useState<ToolItem[]>([]);
  const [loadingTools, setLoadingTools] = useState(true);

  useEffect(() => {
    api.tools.list().then((res) => {
      setTools(res.data as ToolItem[]);
    }).catch(() => {}).finally(() => setLoadingTools(false));
  }, []);

  const filtered = tools.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase()),
  );

  function openTool(id: string) {
    // Only blog-generator has a real UI panel right now
    if (id === "blog-generator") setActivePanel(id);
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-t-primary">Tools</h1>
            <p className="mt-1 text-sm text-t-secondary">Browse and manage your AI tools</p>
          </div>
          <div className="flex gap-2">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-input px-3 py-2">
              <Search className="h-4 w-4 text-t-muted" />
              <input
                type="text"
                placeholder="Search tools…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent text-sm text-input-text placeholder:text-input-placeholder focus:outline-none"
              />
            </div>
            <button className="flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm text-t-secondary hover:bg-hover">
              <Filter className="h-4 w-4" /> Filter
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {loadingTools ? (
            <div className="col-span-3 flex items-center justify-center py-20 text-t-muted">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading tools…
            </div>
          ) : filtered.length === 0 ? (
            <div className="col-span-3 py-20 text-center text-t-muted">No tools found</div>
          ) : (
          filtered.map((tool, i) => {
            const Icon = ICON_MAP[tool.handlerType] ?? Wrench;
            return (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group rounded-2xl border border-border bg-card p-5 backdrop-blur-xl transition-colors hover:border-a-text/30"
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-a-bg text-a-text">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-t-primary">{tool.name}</h4>
                    <span className="text-xs text-t-muted">{tool.category}</span>
                  </div>
                  <span className="rounded-full bg-a-emerald-bg px-2 py-0.5 text-xs text-a-emerald-text">
                    {tool.pricingCredits} credits
                  </span>
                </div>
                <p className="mb-4 text-sm leading-relaxed text-t-secondary">{tool.description}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => openTool(tool.slug ?? tool.id)}
                    className="rounded-lg bg-indigo-500/80 px-3 py-1.5 text-xs text-white transition-colors hover:bg-indigo-500"
                  >
                    Run
                  </button>
                  <button className="rounded-lg border border-border-hover px-3 py-1.5 text-xs text-t-secondary transition-colors hover:bg-hover">
                    Details
                  </button>
                </div>
              </motion.div>
            );
          })
          )}
        </div>
      </div>

      {/* Blog Generator panel */}
      <AnimatePresence>
        {activePanel === "blog-generator" && (
          <BlogGeneratorPanel onClose={() => setActivePanel(null)} />
        )}
      </AnimatePresence>
    </>
  );
}
