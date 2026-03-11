export type PluginType = "tool" | "suite" | "agent_pack" | "connector" | "app" | "workflow_template";

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  type: PluginType;
  description?: string;
  author?: string;
  dependencies?: Record<string, string>;
  permissions?: string[];
  entryPoint: string;
  ui?: {
    icon?: string;
    components?: string[];
    routes?: Array<{ path: string; component: string }>;
  };
  api?: {
    routes?: Array<{ method: string; path: string; handler: string }>;
  };
  runtime?: {
    handlerType?: string;
    configuration?: Record<string, unknown>;
  };
}

export interface PluginModule {
  manifest: PluginManifest;
  activate: (context: PluginContext) => Promise<void>;
  deactivate?: () => Promise<void>;
}

export interface PluginContext {
  workspaceId: string;
  organizationId: string;
  registerRoute: (method: string, path: string, handler: unknown) => void;
  registerComponent: (name: string, component: unknown) => void;
  getService: <T>(name: string) => T;
  logger: PluginLogger;
}

export interface PluginLogger {
  info: (message: string, meta?: Record<string, unknown>) => void;
  warn: (message: string, meta?: Record<string, unknown>) => void;
  error: (message: string, meta?: Record<string, unknown>) => void;
}

export interface PluginLifecycle {
  onInstall?: () => Promise<void>;
  onUninstall?: () => Promise<void>;
  onEnable?: () => Promise<void>;
  onDisable?: () => Promise<void>;
  onUpdate?: (fromVersion: string) => Promise<void>;
}
