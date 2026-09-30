const API_BASE = "/api/backend";

async function parseJsonSafely(res: Response) {
  const text = await res.text();

  try {
    return JSON.parse(text);
  } catch {
    throw new Error("The server is starting up, please try again in a moment.");
  }
}

export async function apiPost<T>(
  path: string,
  body: unknown,
  _retry = true
): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });

    const json = await parseJsonSafely(res);

    if (!res.ok || !json.success) {
      throw new Error(json.message ?? "Request failed");
    }

    return json.data as T;
  } catch (err) {
    if (_retry && err instanceof Error && err.message.includes("starting up")) {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      return apiPost<T>(path, body, false);
    }

    throw err;
  }
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { credentials: "include" });
  const json = await parseJsonSafely(res);

  if (!res.ok || !json.success) {
    throw new Error(json.message ?? "Request failed");
  }

  return json.data as T;
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });

  const json = await parseJsonSafely(res);

  if (!res.ok || !json.success) {
    throw new Error(json.message ?? "Request failed");
  }

  return json.data as T;
}

export async function apiDelete<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "DELETE",
    credentials: "include",
  });

  const json = await parseJsonSafely(res);

  if (!res.ok || !json.success) {
    throw new Error(json.message ?? "Request failed");
  }

  return json.data as T;
}
