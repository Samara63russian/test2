const TOKEN_KEY = "spravka_token";

export type User = {
  id: number;
  username: string;
  full_name: string;
  role: string;
  institution_id: number | null;
  is_active: boolean;
};

export type Institution = {
  id: number;
  name: string;
  code: string;
  type_code: string;
  district: string;
  address: string;
  phone: string;
  email: string;
  head_name: string;
  is_active: boolean;
};

export type DictionaryItem = {
  id: number;
  group_code: string;
  name: string;
  code: string;
  extra: string;
  sort_order: number;
  is_active: boolean;
};

export type Category = {
  id: number;
  name: string;
  sort_order: number;
  is_active: boolean;
};

export type Question = {
  id: number;
  category_id: number;
  text: string;
  hint: string;
  answer_type: string;
  options: string;
  required: boolean;
  sort_order: number;
  is_active: boolean;
};

export type Answer = {
  question_id: number;
  value: string;
  question_text?: string;
  answer_type?: string;
};

export type Report = {
  id: number;
  institution_id: number;
  institution_name: string;
  user_id: number;
  user_name: string;
  report_date: string;
  status: string;
  client_uuid: string | null;
  created_at: string;
  updated_at: string;
  submitted_at: string | null;
  answers: Answer[];
};

export type Analytics = {
  total_reports: number;
  submitted: number;
  drafts: number;
  users: number;
  institutions: number;
  questions: number;
  by_institution: { institution_id: number; name: string; count: number; submitted: number }[];
  by_month: { month: string; count: number }[];
};

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (!(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(path, { ...init, headers });
  if (res.status === 401) {
    setToken(null);
    if (!path.includes("/api/auth/login")) {
      window.location.href = "/login";
    }
  }
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const data = await res.json();
      detail = data.detail || JSON.stringify(data);
    } catch {
      /* ignore */
    }
    throw new Error(detail);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  login: (username: string, password: string) =>
    request<{ access_token: string; user: User }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  me: () => request<User>("/api/auth/me"),
  institutions: () => request<Institution[]>("/api/institutions"),
  saveInstitution: (item: Partial<Institution> & { id?: number }) =>
    request<Institution>(item.id ? `/api/institutions/${item.id}` : "/api/institutions", {
      method: item.id ? "PUT" : "POST",
      body: JSON.stringify(item),
    }),
  deleteInstitution: (id: number) => request(`/api/institutions/${id}`, { method: "DELETE" }),
  users: () => request<User[]>("/api/users"),
  saveUser: (item: Record<string, unknown> & { id?: number }) =>
    request<User>(item.id ? `/api/users/${item.id}` : "/api/users", {
      method: item.id ? "PUT" : "POST",
      body: JSON.stringify(item),
    }),
  deleteUser: (id: number) => request(`/api/users/${id}`, { method: "DELETE" }),
  dictionary: (group?: string) => request<DictionaryItem[]>(`/api/dictionary${group ? `?group=${group}` : ""}`),
  saveDictionary: (item: Partial<DictionaryItem> & { id?: number }) =>
    request<DictionaryItem>(item.id ? `/api/dictionary/${item.id}` : "/api/dictionary", {
      method: item.id ? "PUT" : "POST",
      body: JSON.stringify(item),
    }),
  deleteDictionary: (id: number) => request(`/api/dictionary/${id}`, { method: "DELETE" }),
  categories: () => request<Category[]>("/api/categories"),
  saveCategory: (item: Partial<Category> & { id?: number }) =>
    request<Category>(item.id ? `/api/categories/${item.id}` : "/api/categories", {
      method: item.id ? "PUT" : "POST",
      body: JSON.stringify(item),
    }),
  deleteCategory: (id: number) => request(`/api/categories/${id}`, { method: "DELETE" }),
  questions: () => request<Question[]>("/api/questions"),
  saveQuestion: (item: Partial<Question> & { id?: number }) =>
    request<Question>(item.id ? `/api/questions/${item.id}` : "/api/questions", {
      method: item.id ? "PUT" : "POST",
      body: JSON.stringify(item),
    }),
  deleteQuestion: (id: number) => request(`/api/questions/${id}`, { method: "DELETE" }),
  reports: (params: Record<string, string | number | undefined> = {}) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== "") q.set(k, String(v));
    });
    const suffix = q.toString() ? `?${q}` : "";
    return request<Report[]>(`/api/reports${suffix}`);
  },
  report: (id: number) => request<Report>(`/api/reports/${id}`),
  saveReport: (payload: Record<string, unknown>, id?: number) =>
    request<Report>(id ? `/api/reports/${id}` : "/api/reports", {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(payload),
    }),
  deleteReport: (id: number) => request(`/api/reports/${id}`, { method: "DELETE" }),
  analytics: () => request<Analytics>("/api/analytics"),
  settings: () => request<Record<string, string>>("/api/settings"),
  saveSettings: (items: { key: string; value: string }[]) =>
    request<Record<string, string>>("/api/settings", { method: "PUT", body: JSON.stringify(items) }),
  bootstrap: () => request<Record<string, unknown>>("/api/bootstrap"),
};

export async function downloadDocument(reportId: number, kind: "pdf" | "docx") {
  const token = getToken();
  const res = await fetch(`/api/reports/${reportId}/document.${kind}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error("Не удалось скачать документ");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `spravka_${reportId}.${kind}`;
  a.click();
  URL.revokeObjectURL(url);
}

export function formatDate(value?: string | null) {
  if (!value) return "—";
  const d = value.slice(0, 10);
  const [y, m, day] = d.split("-");
  return `${day}.${m}.${y}`;
}

export function statusLabel(status: string) {
  return status === "submitted" ? "Утверждена" : "Черновик";
}
