import type { PluginManifest, PluginModule } from "./types.js";

export class PluginLoader {
  /**
   * Load a plugin from a manifest. In production, this resolves the entryPoint
   * from the module registry / filesystem / CDN.
   */
  async load(manifest: PluginManifest): Promise<PluginModule> {
    // Validate manifest
    this.validateManifest(manifest);

    // Dynamic import of the plugin entry point
    // In production: const mod = await import(manifest.entryPoint);
    return {
      manifest,
      activate: async () => {
        console.log(`[Plugin] Activated: ${manifest.name} v${manifest.version}`);
      },
      deactivate: async () => {
        console.log(`[Plugin] Deactivated: ${manifest.name}`);
      },
    };
  }

  private validateManifest(manifest: PluginManifest): void {
    if (!manifest.id) throw new Error("Plugin manifest must have an id");
    if (!manifest.name) throw new Error("Plugin manifest must have a name");
    if (!manifest.version) throw new Error("Plugin manifest must have a version");
    if (!manifest.type) throw new Error("Plugin manifest must have a type");
    if (!manifest.entryPoint) throw new Error("Plugin manifest must have an entryPoint");
  }
}
