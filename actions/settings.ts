"use server"

import { apiFetch } from "./api"
import type { SettingsCreateInput, SettingsRecord } from "@/lib/types"

export async function getSettings(): Promise<{ success: boolean; data?: SettingsRecord; error?: string }> {
  const res = await apiFetch<SettingsRecord>(`/admin/settings`)
  if (!res.ok) return { success: false, error: res.error }
  return { success: true, data: res.data }
}

export async function setSettings(payload: SettingsCreateInput): Promise<{ success: boolean; data?: SettingsRecord; error?: string }> {
  const res = await apiFetch<SettingsRecord>(`/admin/settings`, {
    method: "POST",
    body: JSON.stringify(payload),
  })
  if (!res.ok) return { success: false, error: res.error }
  return { success: true, data: res.data }
}

export type SettingsActionState = { success?: boolean; error?: string; data?: SettingsRecord }

export async function setSettingsFormAction(_prev: SettingsActionState, formData: FormData): Promise<SettingsActionState> {
  const payload: SettingsCreateInput = {
    company_name: (formData.get("company_name") as string | null) ?? null,
    company_email: (formData.get("company_email") as string | null) ?? null,
    company_number: (formData.get("company_number") as string | null) ?? null,
    company_logo: (formData.get("company_logo") as string | null) ?? null,
    company_url: (formData.get("company_url") as string | null) ?? null,
  }
  const res = await setSettings(payload)
  if (!res.success) return { success: false, error: res.error }
  return { success: true, data: res.data }
}
