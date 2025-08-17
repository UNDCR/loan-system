"use server"

import { apiFetch } from "./api";
import { EnrichedLoan, LoanTrendPoint } from "@/lib/types";

export type LatestPayment = { full_name: string | null; amount: number; created_at: string };
export type PendingLoan = { full_name: string | null; status: "Pending Payment"; remaining_amount: number | null };

export async function fetchLatestPayments(): Promise<LatestPayment[]> {
  const res = await apiFetch<LatestPayment[]>("/loans?status=Paid&include=customer&limit=10");
  return res.ok && res.data ? res.data : [];
}

export async function fetchPendingLoans(): Promise<PendingLoan[]> {
  const res = await apiFetch<PendingLoan[]>("/loans?status=Pending Payment&include=customer");
  return res.ok && res.data ? res.data : [];
}

export async function fetchLoanTrends(): Promise<{ success: true; data: LoanTrendPoint[] } | { success: false; error: string }> {
  try {
    const res = await apiFetch<EnrichedLoan[]>("/loans?include=customer,firearm&limit=1000");
    if (!res.ok || !res.data) return { success: false, error: res.error || "Failed to fetch loans" } as const;
    const rows = Array.isArray(res.data) ? res.data : [];
    const now = new Date();
    const months: Array<{ key: string; month: string; loan_count: number; total_loan_value: number }> = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now);
      d.setMonth(now.getMonth() - i);
      d.setDate(1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months.push({ key, month: d.toISOString().split('T')[0], loan_count: 0, total_loan_value: 0 });
    }
    const bucket = new Map(months.map(m => [m.key, m] as const));
    for (const r of rows) {
      const sd = r.start_date ? new Date(r.start_date) : null;
      if (!sd) continue;
      const key = `${sd.getFullYear()}-${String(sd.getMonth() + 1).padStart(2, '0')}`;
      const b = bucket.get(key);
      if (!b) continue;
      b.loan_count += 1;
      b.total_loan_value += Number(r.loan_amount ?? 0);
    }
    const data: LoanTrendPoint[] = months.map(m => ({ month: m.month, loan_count: m.loan_count, total_loan_value: m.total_loan_value }));
    return { success: true, data } as const;
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Request failed" } as const;
  }
}

