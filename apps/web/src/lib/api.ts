const API_BASE = "/api/backend";

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const json = await res.json();

  if (!res.ok || !json.success) {
    throw new Error(json.message ?? "Request failed");
  }

  return json.data as T;
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  const json = await res.json();

  if (!res.ok || !json.success) {
    throw new Error(json.message ?? "Request failed");
  }

  return json.data as T;
}