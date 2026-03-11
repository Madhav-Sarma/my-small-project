import type { PluginManifest, PluginModule, PluginType } from "./types.js";

export interface PluginRegistryOptions {
  maxPlugins?: number;
}

interface RegisteredPlugin {
  manifest: PluginManifest;
  module: PluginModule;
  enabled: boolean;
}

export class PluginRegistry {
  private plugins = new Map<string, RegisteredPlugin>();
  private maxPlugins: number;

  constructor(options: PluginRegistryOptions = {}) {
    this.maxPlugins = options.maxPlugins ?? 1000;
  }

  register(module: PluginModule): void {
    if (this.plugins.size >= this.maxPlugins) {
      throw new Error("Plugin limit reached");
    }
    this.plugins.set(module.manifest.id, {
      manifest: module.manifest,
      module,
      enabled: true,
    });
  }

  unregister(pluginId: string): boolean {
    return this.plugins.delete(pluginId);
  }

  get(pluginId: string): RegisteredPlugin | undefined {
    return this.plugins.get(pluginId);
  }

  getByType(type: PluginType): RegisteredPlugin[] {
    return Array.from(this.plugins.values()).filter((p) => p.manifest.type === type);
  }

  listAll(): PluginManifest[] {
    return Array.from(this.plugins.values()).map((p) => p.manifest);
  }

  isRegistered(pluginId: string): boolean {
    return this.plugins.has(pluginId);
  }

  enable(pluginId: string): void {
    const plugin = this.plugins.get(pluginId);
    if (plugin) plugin.enabled = true;
  }

  disable(pluginId: string): void {
    const plugin = this.plugins.get(pluginId);
    if (plugin) plugin.enabled = false;
  }
}
