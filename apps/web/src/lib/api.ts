const API_BASE = "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || "Request failed");
  }
  return res.json();
}

export const api = {
  tools: {
    list: () => request<{ data: unknown[] }>("/tools"),
    get: (id: string) => request<{ data: unknown }>(`/tools/${id}`),
    install: (id: string, workspaceId: string) =>
      request("/tools/" + id + "/install", { method: "POST", body: JSON.stringify({ workspaceId }) }),
    execute: (id: string, body: Record<string, unknown>) =>
      request("/tools/" + id + "/execute", { method: "POST", body: JSON.stringify(body) }),
  },
  suites: {
    list: () => request<{ data: unknown[] }>("/suites"),
    get: (id: string) => request<{ data: unknown }>(`/suites/${id}`),
    install: (id: string, workspaceId: string) =>
      request("/suites/" + id + "/install", { method: "POST", body: JSON.stringify({ workspaceId }) }),
  },
  agents: {
    list: () => request<{ data: unknown[] }>("/agents"),
    get: (id: string) => request<{ data: unknown }>(`/agents/${id}`),
  },
  workflows: {
    list: () => request<{ data: unknown[] }>("/workflows"),
    get: (id: string) => request<{ data: unknown }>(`/workflows/${id}`),
    execute: (id: string, input?: Record<string, unknown>) =>
      request("/workflows/" + id + "/execute", { method: "POST", body: JSON.stringify({ input }) }),
  },
  marketplace: {
    list: (params?: Record<string, string>) => {
      const qs = params ? "?" + new URLSearchParams(params).toString() : "";
      return request<{ data: unknown[] }>(`/marketplace${qs}`);
    },
  },
  apps: {
    list: () => request<{ data: unknown[] }>("/apps"),
    install: (id: string, workspaceId: string) =>
      request("/apps/" + id + "/install", { method: "POST", body: JSON.stringify({ workspaceId }) }),
  },
};
