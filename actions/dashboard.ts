"use server"

import { apiFetch } from "./api";
import { EnrichedLoan, LoanTrendPoint, DashboardSummaryResponse } from "@/lib/types";

export type LatestPayment = { full_name: string | null; amount: number; created_at: string };
export type PendingLoan = { full_name: string | null; status: "Pending Payment"; remaining_amount: number | null };

export interface CreditPaymentHistoryItem {
  id: string;
  payment_amount: number;
  created_at: string;
  payment_date?: string;
  customer_name?: string | null;
  customer_id_number?: string | null;
  payment_type?: string | null;
}

export async function fetchLatestPayments(): Promise<LatestPayment[]> {
  const res = await apiFetch<LatestPayment[]>("/loans?status=Paid&include=customer&limit=10");
  return res.ok && res.data ? res.data : [];
}

export async function fetchPendingLoans(): Promise<PendingLoan[]> {
  const res = await apiFetch<PendingLoan[]>("/loans?status=Pending Payment&include=customer");
  return res.ok && res.data ? res.data : [];
}

export async function fetchDashboardSummary(): Promise<DashboardSummaryResponse | null> {
  const res = await apiFetch<DashboardSummaryResponse["data"]>("/dashboard/summary");
  if (!res.ok || !res.data) return null;
  return {
    success: true,
    data: res.data
  };
}

type FetchCreditPaymentHistoryParams = {
  page?: number;
  limit?: number;
  includeCustomer?: boolean;
  date_order?: "asc" | "desc";
};

export async function fetchCreditPaymentHistory(params?: FetchCreditPaymentHistoryParams): Promise<{
  data: CreditPaymentHistoryItem[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}> {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.includeCustomer) query.set("include", "customer");
  if (params?.date_order) query.set("date_order", params.date_order);

  const base = "/customers/payment-history";
  const path = query.size ? `${base}?${query.toString()}` : base;

  type APIItem = {
    id: string;
    credit_amount: number;
    created_at: string;
    payment_type?: string | null;
    customers?: {
      id: string;
      full_name: string;
      id_number: string;
    } | null;
  };

  const res = await apiFetch<APIItem[] | { items: APIItem[] }>(path);
  if (!res.ok) return { data: [], pagination: { page: params?.page ?? 1, limit: params?.limit ?? 10, total: 0, totalPages: 0 } };

  const rawItems: APIItem[] = Array.isArray(res.data)
    ? (res.data as APIItem[])
    : (res.data && typeof res.data === "object" && "items" in res.data
        ? (res.data as { items: APIItem[] }).items
        : []);

  const items: CreditPaymentHistoryItem[] = rawItems.map((i) => ({
    id: i.id,
    payment_amount: i.credit_amount,
    created_at: i.created_at,
    payment_type: i.payment_type,
    customer_name: i.customers?.full_name ?? null,
    customer_id_number: i.customers?.id_number ?? null,
  }));

  const page = params?.page ?? 1;
  const limit = params?.limit ?? 10;
  const total = (res as unknown as { data?: unknown; pagination?: { total?: number } }).pagination?.total ?? items.length;
  const totalPages = (res as unknown as { data?: unknown; pagination?: { totalPages?: number } }).pagination?.totalPages ?? Math.ceil(total / limit);

  return { data: items, pagination: { page, limit, total, totalPages } };
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

