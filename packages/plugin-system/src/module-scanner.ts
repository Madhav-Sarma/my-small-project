import { readdir, readFile, access } from "node:fs/promises";
import { join, resolve } from "node:path";
import type { PluginManifest } from "./types.js";
import { PluginLoader } from "./loader.js";
import { PluginRegistry } from "./registry.js";

export interface ScanResult {
  /** Successfully loaded plugin manifests. */
  registered: PluginManifest[];
  /** Errors encountered while scanning individual module directories. */
  errors: Array<{ path: string; error: string }>;
}

/**
 * Scans the `modules/` directory tree and auto-registers every module that
 * contains a valid `manifest.json`.
 *
 * Expected directory layout (any depth within the category level is supported):
 * ```
 * modules/
 *   tools/
 *     blog-generator/
 *       manifest.json
 *       handler.ts
 *   connectors/
 *     notion/
 *       manifest.json
 *   suites/
 *     student-suite/
 *       manifest.json
 *   apps/
 *     whiteboard/
 *       manifest.json
 *   agent-packs/
 *     research-pack/
 *       manifest.json
 * ```
 *
 * Modules without an `entryPoint` in their manifest (e.g. declarative REST
 * connectors) are still registered — the loader's activate stub is used.
 */
export class ModuleScanner {
  private loader: PluginLoader;

  constructor(
    private readonly modulesDir: string,
    private readonly registry: PluginRegistry,
  ) {
    this.loader = new PluginLoader();
  }

  /**
   * Scan the modules directory, load each manifest, and register valid plugins.
   *
   * Skips modules that are already registered to support hot-reload scenarios.
   * Errors in one module never prevent others from loading.
   */
  async scan(): Promise<ScanResult> {
    const registered: PluginManifest[] = [];
    const errors: Array<{ path: string; error: string }> = [];

    const absoluteModulesDir = resolve(this.modulesDir);

    let categories: string[];
    try {
      const entries = await readdir(absoluteModulesDir, { withFileTypes: true });
      categories = entries.filter((e) => e.isDirectory()).map((e) => e.name);
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      return { registered, errors: [{ path: absoluteModulesDir, error: `Cannot read modules dir: ${error}` }] };
    }

    for (const category of categories) {
      const categoryPath = join(absoluteModulesDir, category);

      let moduleDirs: string[];
      try {
        const entries = await readdir(categoryPath, { withFileTypes: true });
        moduleDirs = entries.filter((e) => e.isDirectory()).map((e) => e.name);
      } catch (err) {
        errors.push({ path: categoryPath, error: `Cannot read category dir: ${err instanceof Error ? err.message : String(err)}` });
        continue;
      }

      for (const moduleName of moduleDirs) {
        const modulePath = join(categoryPath, moduleName);
        const manifestPath = join(modulePath, "manifest.json");

        // Skip if manifest doesn't exist
        try {
          await access(manifestPath);
        } catch {
          continue;
        }

        let manifest: PluginManifest;
        try {
          const raw = await readFile(manifestPath, "utf-8");
          const parsed = JSON.parse(raw) as Record<string, unknown>;

          // Normalise the manifest: infer entryPoint if absent (required by PluginManifest).
          manifest = await this.normaliseManifest(parsed, modulePath);
        } catch (err) {
          errors.push({ path: manifestPath, error: err instanceof Error ? err.message : String(err) });
          continue;
        }

        // Skip already-registered plugins (idempotent scanning)
        if (this.registry.isRegistered(manifest.id)) {
          registered.push(manifest);
          continue;
        }

        try {
          const pluginModule = await this.loader.load(manifest);
          this.registry.register(pluginModule);
          registered.push(manifest);
        } catch (err) {
          errors.push({ path: manifestPath, error: err instanceof Error ? err.message : String(err) });
        }
      }
    }

    return { registered, errors };
  }

  /**
   * Coerce the raw JSON manifest into a {@link PluginManifest}.
   * If `entryPoint` is missing, we probe common filenames in the module directory
   * so declarative connectors / suites that have no code still satisfy the interface.
   */
  private async normaliseManifest(
    raw: Record<string, unknown>,
    modulePath: string,
  ): Promise<PluginManifest> {
    let entryPoint = typeof raw["entryPoint"] === "string" ? raw["entryPoint"] : "";

    if (!entryPoint) {
      entryPoint = await this.inferEntryPoint(modulePath);
    }

    return {
      id: String(raw["id"] ?? ""),
      name: String(raw["name"] ?? ""),
      version: String(raw["version"] ?? "1.0.0"),
      type: raw["type"] as PluginManifest["type"],
      description: typeof raw["description"] === "string" ? raw["description"] : undefined,
      author: typeof raw["author"] === "string" ? raw["author"] : undefined,
      permissions: Array.isArray(raw["permissions"]) ? (raw["permissions"] as string[]) : undefined,
      dependencies:
        raw["dependencies"] && typeof raw["dependencies"] === "object"
          ? (raw["dependencies"] as Record<string, string>)
          : undefined,
      entryPoint,
      ui: raw["ui"] as PluginManifest["ui"],
      api: raw["api"] as PluginManifest["api"],
      runtime: raw["runtime"] as PluginManifest["runtime"],
    };
  }

  /** Probe for common entry-point filenames; returns an empty string if none exist. */
  private async inferEntryPoint(modulePath: string): Promise<string> {
    const candidates = ["handler.ts", "index.ts", "handler.js", "index.js"];
    for (const candidate of candidates) {
      try {
        await access(join(modulePath, candidate));
        return `./${candidate}`;
      } catch {
        // not found, try next
      }
    }
    return "";
  }
}

/**
 * Convenience factory: creates a {@link PluginRegistry}, runs {@link ModuleScanner},
 * logs results, and returns both the registry and scan result.
 *
 * @example
 * const { registry, result } = await scanAndRegisterModules(
 *   path.resolve(__dirname, "../../modules"),
 * );
 */
export async function scanAndRegisterModules(modulesDir: string): Promise<{
  registry: PluginRegistry;
  result: ScanResult;
}> {
  const registry = new PluginRegistry();
  const scanner = new ModuleScanner(modulesDir, registry);
  const result = await scanner.scan();

  const total = result.registered.length + result.errors.length;
  console.log(`[ModuleScanner] Scanned ${total} modules — ${result.registered.length} registered, ${result.errors.length} errors`);

  for (const { path, error } of result.errors) {
    console.error(`[ModuleScanner] Failed to load module at ${path}: ${error}`);
  }

  return { registry, result };
}
