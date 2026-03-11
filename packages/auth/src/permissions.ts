export type Permission =
  | "tools:read"
  | "tools:execute"
  | "tools:manage"
  | "workflows:read"
  | "workflows:execute"
  | "workflows:manage"
  | "agents:read"
  | "agents:execute"
  | "agents:manage"
  | "documents:read"
  | "documents:write"
  | "billing:read"
  | "billing:manage"
  | "workspace:manage"
  | "organization:manage";

const rolePermissions: Record<string, Permission[]> = {
  owner: [
    "tools:read", "tools:execute", "tools:manage",
    "workflows:read", "workflows:execute", "workflows:manage",
    "agents:read", "agents:execute", "agents:manage",
    "documents:read", "documents:write",
    "billing:read", "billing:manage",
    "workspace:manage", "organization:manage",
  ],
  admin: [
    "tools:read", "tools:execute", "tools:manage",
    "workflows:read", "workflows:execute", "workflows:manage",
    "agents:read", "agents:execute", "agents:manage",
    "documents:read", "documents:write",
    "billing:read",
    "workspace:manage",
  ],
  member: [
    "tools:read", "tools:execute",
    "workflows:read", "workflows:execute",
    "agents:read", "agents:execute",
    "documents:read", "documents:write",
  ],
};

export function hasPermission(role: string, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) ?? false;
}
