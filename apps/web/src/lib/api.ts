const API_BASE = "/api/v1";

// Clerk token getter — set by the app after Clerk initializes
let _getToken: (() => Promise<string | null>) | null = null;

export function setAuthTokenGetter(getter: () => Promise<string | null>) {
  _getToken = getter;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string> | undefined),
  };

  if (_getToken) {
    const token = await _getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error || "Request failed");
  }
  return res.json();
}

export interface ToolRunRequest {
  toolId: string;
  modelId: string;
  inputs: Record<string, unknown>;
}

export interface AIModel {
  id: string;
  provider: string;
  modelName: string;
  displayName: string;
  category: string;
  description: string | null;
  contextWindow: number;
  maxOutputTokens: number;
  inputCostPer1kTokens: number;
  outputCostPer1kTokens: number;
  enabled: boolean;
}

export interface TextDocumentOutput {
  content: string;
}

export interface ToolRunResult {
  success: boolean;
  jobId: string;
  creditsCharged: number;
  output?: {
    type: "text_document" | "code_project" | "editable_image" | "raw_json" | "file_download";
    data: unknown;
    metadata: {
      tokensUsed?: number;
      model: string;
      provider: string;
      executionTimeMs: number;
    };
  };
  error?: string;
}

export const api = {
  tools: {
    list: () => request<{ data: unknown[] }>("/tools"),
    get: (id: string) => request<{ data: unknown }>(`/tools/${id}`),
    install: (id: string, workspaceId: string) =>
      request("/tools/" + id + "/install", { method: "POST", body: JSON.stringify({ workspaceId }) }),
    execute: (id: string, body: Record<string, unknown>) =>
      request("/tools/" + id + "/execute", { method: "POST", body: JSON.stringify(body) }),
    run: (payload: ToolRunRequest) =>
      request<{ data: ToolRunResult }>("/tools/run", { method: "POST", body: JSON.stringify(payload) }),
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
  models: {
    list: () => request<{ data: AIModel[] }>("/models"),
    get: (id: string) => request<{ data: AIModel }>(`/models/${id}`),
    byProvider: (provider: string) => request<{ data: AIModel[] }>(`/models/provider/${provider}`),
    byCategory: (category: string) => request<{ data: AIModel[] }>(`/models/category/${category}`),
  },
  settings: {
    get: () => request<{ data: { heroView: string; [key: string]: unknown } }>("/settings"),
    update: (settings: Record<string, unknown>) =>
      request<{ data: unknown }>("/settings", { method: "PUT", body: JSON.stringify(settings) }),
  },
  users: {
    bootstrap: (profile?: { email?: string; name?: string; avatarUrl?: string }) =>
      request<{ data: { id: string; organizationId: string; workspaceId: string } }>("/users/bootstrap", { method: "POST", body: JSON.stringify(profile ?? {}) }),
  },
  billing: {
    getWallet: (orgId: string) => request<{ data: { balance: number } }>(`/billing/wallet/${orgId}`),
    createOrder: (amount: number) =>
      request<{ data: { orderId: string; amount: number; currency: string; keyId: string } }>("/billing/create-order", { method: "POST", body: JSON.stringify({ amount }) }),
    verifyPayment: (payload: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) =>
      request<{ data: { success: boolean; creditsAdded: number } }>("/billing/verify-payment", { method: "POST", body: JSON.stringify(payload) }),
  },
};
