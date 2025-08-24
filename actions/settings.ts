"use server"

import { apiFetch } from "./api"
import type { SettingsCreateInput, SettingsRecord } from "@/lib/types"
import { uploadImageFormAction } from "./images"

export async function getSettings(): Promise<{ success: boolean; data?: SettingsRecord; error?: string }> {
  const res = await apiFetch<SettingsRecord>(`/admin/settings`)
  if (!res.ok) return { success: false, error: res.error }
  return { success: true, data: res.data }
}

export async function setSettings(payload: SettingsCreateInput): Promise<{ success: boolean; data?: SettingsRecord; error?: string }> {
  const res = await apiFetch<SettingsRecord>(`/admin/settings`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  })
  if (res.ok) return { success: true, data: res.data }
  if (res.status === 404) {
    const createRes = await apiFetch<SettingsRecord>(`/admin/settings`, {
      method: "POST",
      body: JSON.stringify(payload),
    })
    if (!createRes.ok) return { success: false, error: createRes.error }
    return { success: true, data: createRes.data }
  }
  return { success: false, error: res.error }
}

export type SettingsActionState = { success?: boolean; error?: string; data?: SettingsRecord }

export async function setSettingsFormAction(_prev: SettingsActionState, formData: FormData): Promise<SettingsActionState> {
  const name = (formData.get("company_name") as string | null) ?? null
  const email = (formData.get("company_email") as string | null) ?? null
  const number = (formData.get("company_number") as string | null) ?? null
  const url = (formData.get("company_url") as string | null) ?? null
  const providedLogoUrl = (formData.get("company_logo") as string | null) ?? null

  const logoFile = formData.get("logo_file")

  const firstPayload: SettingsCreateInput = {
    company_name: name,
    company_email: email,
    company_number: number,
    company_logo: providedLogoUrl,
    company_url: url,
  }
  const firstRes = await setSettings(firstPayload)
  if (!firstRes.success) return { success: false, error: firstRes.error }

  if (logoFile instanceof File) {
    const uploadFd = new FormData()
    uploadFd.set("file", logoFile)
    const uploadRes = await uploadImageFormAction({}, uploadFd)
    if (!uploadRes.success || !uploadRes.url) {
      return { success: false, error: uploadRes.error || "Upload failed" }
    }
    const secondPayload: SettingsCreateInput = {
      ...firstPayload,
      company_logo: uploadRes.url,
    }
    const secondRes = await setSettings(secondPayload)
    if (!secondRes.success) return { success: false, error: secondRes.error }
    return { success: true, data: secondRes.data }
  }

  return { success: true, data: firstRes.data }
}

export async function setCompanyLogoAction(
  _prev: { success?: boolean; error?: string },
  formData: FormData,
): Promise<{ success?: boolean; error?: string }> {
  const url = (formData.get("url") as string | null) ?? null
  if (!url) return { success: false, error: "Missing url" }
  const res = await setSettings({ company_logo: url })
  if (!res.success) return { success: false, error: res.error }
  return { success: true }
}
