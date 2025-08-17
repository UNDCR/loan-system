"use server"

import { createClient } from "@/lib/supabase/server";

export async function getAccessToken(): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

function apiBase(): string {
  const url = process.env.NEXT_PUBLIC_BACKEN_URL;
  if (!url) {
    throw new Error("NEXT_PUBLIC_BACKEN_URL is required");
  }
  return url;
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<{ ok: boolean; status: number; data?: T; error?: string; success?: boolean }> {
  const token = await getAccessToken();
  const fullPath = path.startsWith('/api/v1') ? path : `/api/v1${path}`;
  const res = await fetch(`${apiBase()}${fullPath}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: "no-store",
  });
  const status = res.status;
  let body: unknown = null;
  try { body = await res.json(); } catch { }
  
  if (!res.ok) {
    const error = typeof body === "object" && body && "error" in body 
      ? String((body as { error?: string }).error ?? `HTTP ${status}`) 
      : `HTTP ${status}`;
    return { ok: false, status, error, success: false };
  }
  if (body == null) {
    return { ok: true, status, success: true };
  }

  const apiResponse = body as { success?: boolean; data?: T; error?: string };
  if (apiResponse?.success === false) {
    return { ok: false, status, error: apiResponse.error || "API request failed", success: false };
  }

  return { ok: true, status, data: apiResponse.data, success: apiResponse.success ?? true };
}

