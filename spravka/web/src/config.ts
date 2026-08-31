const API_BASE_KEY = "spravka_api_base";

export function getApiBase(): string {
  const saved = localStorage.getItem(API_BASE_KEY);
  if (saved) return saved.replace(/\/$/, "");
  // Capacitor / file:// — нужен явный адрес сервера
  if (typeof window !== "undefined" && !window.location.protocol.startsWith("http")) {
    return "http://10.0.2.2:8000";
  }
  return "";
}

export function setApiBase(url: string) {
  localStorage.setItem(API_BASE_KEY, url.replace(/\/$/, ""));
}

export function apiUrl(path: string): string {
  const base = getApiBase();
  if (!base) return path;
  if (path.startsWith("http")) return path;
  return `${base}${path}`;
}
