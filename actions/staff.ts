"use server"

import { apiFetch } from "./api";
import type { Staff } from "@/components/staffMembers/staffCard";
import { revalidatePath } from "next/cache";

export type StaffApiRow = {
  id: string;
  full_name: string;
  email: string | null;
  phone_number: string | null;
  role: string | null;
  created_at?: string | null;
  update_at?: string | null;
  id_number: string | null;
  blocked?: boolean | null;
};

export async function fetchStaff(): Promise<Staff[]> {
  const res = await apiFetch<StaffApiRow[]>("/admin/staff");
  const rows: StaffApiRow[] = res.ok && res.data ? res.data : [];
  return rows.map((r) => ({
    id: r.id,
    full_name: r.full_name ?? "",
    email: r.email ?? "",
    phone: r.phone_number ?? "",
    role: r.role ?? "",
    id_number: r.id_number ?? "",
    created_at: r.created_at ?? undefined,
    blocked: r.blocked === true,
  }));
}

export type UpdateStaffPayload = {
  full_name: string
  phone_number: string
  role: string
  id_number: string
  email: string
}

export async function updateStaff(id: string, payload: UpdateStaffPayload): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await apiFetch(`/admin/staff/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    })
    if (!res.ok) return { success: false, error: res.error }
    return { success: true }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Request failed" }
  }
}

export type InviteUserProfile = {
  full_name: string
  phone_number: string
  role: string
  id_number: string
}

export type InviteUserPayload = {
  email: string
  profile: InviteUserProfile
  redirectTo?: string
}

export async function inviteUser(payload: InviteUserPayload): Promise<{ success: boolean; error?: string }> {
  try {
    const redirectTo = payload.redirectTo ?? `${process.env.NEXT_PUBLIC_SITE_URL}/auth/set-password`
    const res = await apiFetch(`/admin/invite-user`, {
      method: "POST",
      body: JSON.stringify({
        email: payload.email,
        redirectTo,
        profile: payload.profile,
      }),
    })
    if (!res.ok) return { success: false, error: res.error }
    return { success: true }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Request failed" }
  }
}

export async function blockStaff(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await apiFetch(`/admin/staff/${encodeURIComponent(id)}/block`, {
      method: "PUT",
    })
    if (!res.ok) return { success: false, error: res.error }
    return { success: true }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Request failed" }
  }
}

export async function unblockStaff(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await apiFetch(`/admin/staff/${encodeURIComponent(id)}/unblock`, {
      method: "PUT",
    })
    if (!res.ok) return { success: false, error: res.error }
    return { success: true }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Request failed" }
  }
}

export async function blockStaffAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "").trim()
  if (!id) return
  await blockStaff(id)
  revalidatePath("/dashboard/staff")
}

export async function unblockStaffAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "").trim()
  if (!id) return
  await unblockStaff(id)
  revalidatePath("/dashboard/staff")
}

export type ActionState = { success?: boolean; error?: string }

export async function blockStaffFormAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const id = String(formData.get("id") ?? "").trim()
  if (!id) return { success: false, error: "Missing id" }
  const res = await blockStaff(id)
  if (!res.success) return { success: false, error: res.error }
  revalidatePath("/dashboard/staff")
  return { success: true }
}

export async function unblockStaffFormAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const id = String(formData.get("id") ?? "").trim()
  if (!id) return { success: false, error: "Missing id" }
  const res = await unblockStaff(id)
  if (!res.success) return { success: false, error: res.error }
  revalidatePath("/dashboard/staff")
  return { success: true }
}

