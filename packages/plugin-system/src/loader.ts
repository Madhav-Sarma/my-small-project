import { pathToFileURL } from "node:url";
import { isAbsolute, resolve } from "node:path";
import type { PluginManifest, PluginModule } from "./types.js";

export class PluginLoader {
  /**
   * Load a plugin module from a manifest.
   *
   * If `manifest.entryPoint` is an absolute path or relative path to an
   * existing file, a dynamic `import()` is attempted and its exported
   * `activate` / `deactivate` lifecycle hooks are used.
   *
   * Falls back to a no-op stub so that declarative modules (connectors,
   * suites, etc.) can be registered without a runnable entry point.
   */
  async load(manifest: PluginManifest): Promise<PluginModule> {
    this.validateManifest(manifest);

    let activate: PluginModule["activate"] = defaultActivate(manifest);
    let deactivate: PluginModule["deactivate"] = defaultDeactivate(manifest);

    if (manifest.entryPoint) {
      try {
        const absPath = isAbsolute(manifest.entryPoint)
          ? manifest.entryPoint
          : resolve(manifest.entryPoint);
        const url = pathToFileURL(absPath).href;
        const mod = (await import(url)) as Partial<PluginModule>;
        if (typeof mod.activate === "function") activate = mod.activate;
        if (typeof mod.deactivate === "function") deactivate = mod.deactivate;
      } catch {
        // Entry point failed to load — fall back to the default stub.
        // This is intentional: declarative manifests without a real module
        // (e.g. connectors that only define REST actions) are still useful.
      }
    }

    return { manifest, activate, deactivate };
  }

  /**
   * Load multiple manifests concurrently.
   * Failures in individual modules are swallowed so one bad plugin can't
   * prevent the rest from registering.
   */
  async loadMany(manifests: PluginManifest[]): Promise<PluginModule[]> {
    const settlements = await Promise.allSettled(manifests.map((m) => this.load(m)));
    return settlements
      .filter((s): s is PromiseFulfilledResult<PluginModule> => s.status === "fulfilled")
      .map((s) => s.value);
  }

  private validateManifest(manifest: PluginManifest): void {
    if (!manifest.id) throw new Error("Plugin manifest must have an id");
    if (!manifest.name) throw new Error("Plugin manifest must have a name");
    if (!manifest.version) throw new Error("Plugin manifest must have a version");
    if (!manifest.type) throw new Error("Plugin manifest must have a type");
    // entryPoint is required only for executable plugin types
    const executableTypes: PluginManifest["type"][] = ["tool", "app", "workflow_template"];
    if (executableTypes.includes(manifest.type) && !manifest.entryPoint) {
      throw new Error(`Plugin manifest of type '${manifest.type}' must have an entryPoint`);
    }
  }
}

function defaultActivate(manifest: PluginManifest): PluginModule["activate"] {
  return async () => {
    console.log(`[Plugin] Activated: ${manifest.name} v${manifest.version} (${manifest.type})`);
  };
}

function defaultDeactivate(manifest: PluginManifest): PluginModule["deactivate"] {
  return async () => {
    console.log(`[Plugin] Deactivated: ${manifest.name}`);
  };
}
