"use server"

import { CreatePayment, CreateCreditPayment, CreditPaymentResponse } from "@/lib/types";
import { apiFetch } from "./api";

export async function recordPayment(input: CreatePayment): Promise<{ success: true; data: { payment: { id: string; payment_amount: string | null; payment_type: string | null; payment_date: string }; loan: { id: string; remain_amount: number | null; status: string | null } } } | { success: false; error?: string }> {
  try {
    const res = await apiFetch<{ payment: { id: string; payment_amount: string | null; payment_type: string | null; payment_date: string }; loan: { id: string; remain_amount: number | null; status: string | null } }>("/api/payments", {
      method: "POST",
      body: JSON.stringify(input),
    });
    if (!res.ok) return { success: false, error: res.error } as const;
    return { success: true, data: res.data! } as const;
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Request failed" } as const;
  }
}

export async function recordLoanPayment(input: CreatePayment): Promise<{ success: true } | { success: false; error?: string }> {
  try {
    const res = await apiFetch<unknown>("/loans/payment", {
      method: "POST",
      body: JSON.stringify(input),
    });
    if (!res.ok) return { success: false, error: res.error } as const;
    return { success: true } as const;
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Request failed" } as const;
  }
}

export async function addCreditPayment(input: CreateCreditPayment): Promise<{ success: true; data: CreditPaymentResponse } | { success: false; error?: string }> {
  try {
    const res = await apiFetch<CreditPaymentResponse>("/customers/payment", {
      method: "POST",
      body: JSON.stringify(input),
    });
    if (!res.ok) return { success: false, error: res.error } as const;
    return { success: true, data: res.data! } as const;
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Request failed" } as const;
  }
}