import { authClient } from "./auth-client";
import { API_URL } from "./index";

export async function apiFetch(path: string, options: RequestInit = {}) {
  const cookie = (await authClient.getCookie?.()) ?? "";
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (cookie) headers.Cookie = cookie;

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { message: text };
  }

  if (!res.ok) {
    throw new Error(data?.message || `Request failed (${res.status})`);
  }

  return data;
}
