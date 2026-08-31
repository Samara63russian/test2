import { apiUrl } from "./config";
import type {
  AnalyticsSummary,
  Institution,
  Question,
  Report,
  User,
} from "./types";

const TOKEN_KEY = "spravka_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(apiUrl(path), { ...options, headers });
  if (!res.ok) {
    let detail = "Ошибка запроса";
    try {
      const data = await res.json();
      detail = data.detail || detail;
    } catch {
      /* ignore */
    }
    throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
  }
  if (res.status === 204) return undefined as T;
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  return res as unknown as T;
}

export const api = {
  login: async (username: string, password: string) => {
    const data = await request<{ access_token: string }>("/api/auth/login-json", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    setToken(data.access_token);
    return data;
  },
  me: () => request<User>("/api/auth/me"),
  users: {
    list: () => request<User[]>("/api/auth/users"),
    create: (body: Partial<User> & { password: string; username: string }) =>
      request<User>("/api/auth/users", { method: "POST", body: JSON.stringify(body) }),
    update: (id: number, body: Record<string, unknown>) =>
      request<User>(`/api/auth/users/${id}`, { method: "PUT", body: JSON.stringify(body) }),
    remove: (id: number) =>
      request<{ ok: boolean }>(`/api/auth/users/${id}`, { method: "DELETE" }),
  },
  institutions: {
    list: (includeInactive = false) =>
      request<Institution[]>(`/api/institutions?include_inactive=${includeInactive}`),
    create: (body: Partial<Institution>) =>
      request<Institution>("/api/institutions", { method: "POST", body: JSON.stringify(body) }),
    update: (id: number, body: Partial<Institution>) =>
      request<Institution>(`/api/institutions/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
      }),
    remove: (id: number) =>
      request<{ ok: boolean }>(`/api/institutions/${id}`, { method: "DELETE" }),
  },
  questions: {
    list: (includeInactive = false) =>
      request<Question[]>(`/api/questions?include_inactive=${includeInactive}`),
    create: (body: Record<string, unknown>) =>
      request<Question>("/api/questions", { method: "POST", body: JSON.stringify(body) }),
    update: (id: number, body: Record<string, unknown>) =>
      request<Question>(`/api/questions/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
      }),
    remove: (id: number) =>
      request<{ ok: boolean }>(`/api/questions/${id}`, { method: "DELETE" }),
  },
  reports: {
    list: (params: Record<string, string | number | undefined> = {}) => {
      const q = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== "" && v !== null) q.set(k, String(v));
      });
      const qs = q.toString();
      return request<Report[]>(`/api/reports${qs ? `?${qs}` : ""}`);
    },
    get: (id: number) => request<Report>(`/api/reports/${id}`),
    create: (body: Record<string, unknown>) =>
      request<Report>("/api/reports", { method: "POST", body: JSON.stringify(body) }),
    update: (id: number, body: Record<string, unknown>) =>
      request<Report>(`/api/reports/${id}`, { method: "PUT", body: JSON.stringify(body) }),
    remove: (id: number) =>
      request<{ ok: boolean }>(`/api/reports/${id}`, { method: "DELETE" }),
    sync: (reports: Record<string, unknown>[]) =>
      request<{ created: Report[]; updated: Report[]; conflicts: string[] }>(
        "/api/reports/sync",
        { method: "POST", body: JSON.stringify({ reports }) },
      ),
    downloadUrl: (id: number, format: "docx" | "xlsx" = "docx") =>
      `/api/reports/${id}/download?format=${format}`,
    exportBulkUrl: (params: Record<string, string | number | undefined> = {}) => {
      const q = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== "" && v !== null) q.set(k, String(v));
      });
      const qs = q.toString();
      return `/api/reports/export/bulk${qs ? `?${qs}` : ""}`;
    },
  },
  analytics: () => request<AnalyticsSummary>("/api/analytics/summary"),
};

export async function downloadWithAuth(url: string, filename: string) {
  const token = getToken();
  const res = await fetch(apiUrl(url), {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error("Не удалось скачать файл");
  const blob = await res.blob();
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}
