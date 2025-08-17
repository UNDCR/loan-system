"use server"

import { createLoan as baseCreateLoan } from "./loans";
import { apiFetch } from "./api";
import { ClientResponse, CreateLoanInput } from "@/lib/types";

export async function createLoan(input: CreateLoanInput) {
  return await baseCreateLoan(input);
}

export async function getClientById(id: string): Promise<{ success: boolean; data?: ClientResponse; error?: string }> {
  const res = await apiFetch<ClientResponse>(`/customers/${encodeURIComponent(id)}?include=address`);

  if (!res.ok) {
    return { success: false, error: res.error };
  }

  return { success: true, data: res.data };
}