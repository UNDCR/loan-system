"use server"

import { apiFetch } from "./api";
import type { ActionState } from "./admin";

export type UploadImageState = ActionState & { url?: string };

export async function uploadImageFormAction(_prev: UploadImageState, formData: FormData): Promise<UploadImageState> {
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { success: false, error: "No file provided" };
  }
  if (file.type !== "image/png") {
    return { success: false, error: "Only PNG images are allowed" };
  }
  if (file.size > 500 * 1024) {
    return { success: false, error: "File too large. Max 500KB" };
  }

  const fd = new FormData();
  fd.set("file", file);

  try {
    const res = await apiFetch<{ url: string }>("/admin/settings/upload", {
      method: "POST",
      body: fd,
    });
    if (!res.ok || !res.data) {
      return { success: false, error: res.error ?? "Upload failed" };
    }
    return { success: true, url: res.data.url };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Upload failed" };
  }
}
