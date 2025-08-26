"use server"

import { apiFetch } from "./api";
import { CreateLoanInput, EnrichedLoan, LoanData, PaginationMetadata } from "@/lib/types";
import { mapLoanToLoanData } from "@/lib/mappers/loan";

export async function fetchLoans(params?: { page?: number; limit?: number; status?: LoanData["status"]; customer_search?: string }): Promise<{ data: LoanData[]; pagination: PaginationMetadata }> {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.status) query.set("status", params.status);
  if (params?.customer_search) query.set("customer_search", params.customer_search);
  const base = "/loans";
  const suffix = query.size ? `?${query.toString()}&include=customer,firearm` : `?include=customer,firearm`;

  const res = await apiFetch<EnrichedLoan[] | { data: EnrichedLoan[]; pagination?: PaginationMetadata }>(`${base}${suffix}`);

  // Handle both array response and paginated response formats
  let loans: EnrichedLoan[] = [];
  let pagination: PaginationMetadata;

  if (res.ok && res.data) {
    if (Array.isArray(res.data)) {
      // Direct array response - calculate pagination based on returned data
      loans = res.data;
      const page = params?.page ?? 1;
      const limit = params?.limit ?? 20;
      const hasNextPage = loans.length === limit;
      const estimatedTotal = hasNextPage ? page * limit + 1 : (page - 1) * limit + loans.length;

      pagination = {
        page,
        limit,
        total: estimatedTotal,
        totalPages: hasNextPage ? page + 1 : page
      };
    } else {
      // Paginated response format
      const apiResponse = res.data as { data: EnrichedLoan[]; pagination?: PaginationMetadata };
      loans = apiResponse.data || [];
      pagination = apiResponse.pagination || {
        page: params?.page ?? 1,
        limit: params?.limit ?? 20,
        total: loans.length,
        totalPages: Math.ceil(loans.length / (params?.limit ?? 20))
      };
    }
  } else {
    loans = [];
    pagination = {
      page: params?.page ?? 1,
      limit: params?.limit ?? 20,
      total: 0,
      totalPages: 0
    };
  }

  return { data: loans.map(mapLoanToLoanData), pagination };
}

export async function createLoan(input: CreateLoanInput): Promise<{ success: true; data: { id: string } } | { success: false; error?: string }> {
  try {
    const res = await apiFetch<{ id: string }>("/loans", {
      method: "POST",
      body: JSON.stringify(input),
    });
    if (!res.ok) return { success: false, error: res.error } as const;
    return { success: true, data: res.data! } as const;
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Request failed" } as const;
  }
}

export type PaymentHistoryItem = {
  id: string;
  payment_amount: number;
  payment_type: "cash" | "card" | "eft" | "Cash" | "Card" | "EFT";
  payment_date: string;
  loan_id: string;
  profile_id: string;
  created_at: string;
  quote_number?: string | null;
};

type FetchPaymentHistoryParams = {
  page?: number;
  limit?: number;
  includeLoan?: boolean;
  includeProfile?: boolean;
  date_order?: "asc" | "desc";
};

export async function fetchLoanPaymentHistory(params?: FetchPaymentHistoryParams): Promise<{
  data: PaymentHistoryItem[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}> {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  const include: string[] = [];
  if (params?.includeLoan) include.push("loan");
  if (params?.includeProfile) include.push("profile");
  if (include.length) query.set("include", include.join(","));
  if (params?.date_order) query.set("date_order", params.date_order);
  const base = "/loans/payment-history";
  const path = query.size ? `${base}?${query.toString()}` : base;
  type APIItem = PaymentHistoryItem & { loans?: { quote_number?: string | null } | null; profile?: unknown };
  const res = await apiFetch<APIItem[] | { items: APIItem[] }>(path);
  if (!res.ok) return { data: [], pagination: { page: params?.page ?? 1, limit: params?.limit ?? 10, total: 0, totalPages: 0 } };

  const rawItems: APIItem[] = Array.isArray(res.data)
    ? (res.data as APIItem[])
    : (res.data && typeof res.data === "object" && "items" in res.data
        ? (res.data as { items: APIItem[] }).items
        : []);

  const items: PaymentHistoryItem[] = rawItems.map((i) => ({
    id: i.id,
    payment_amount: i.payment_amount,
    payment_type: i.payment_type,
    payment_date: i.payment_date,
    loan_id: i.loan_id,
    profile_id: i.profile_id,
    created_at: i.created_at,
    quote_number: i.quote_number ?? i.loans?.quote_number ?? null,
  }));

  const page = params?.page ?? 1;
  const limit = params?.limit ?? 10;
  const total = (res as unknown as { data?: unknown; pagination?: { total?: number } }).pagination?.total ?? items.length;
  const totalPages = (res as unknown as { data?: unknown; pagination?: { totalPages?: number } }).pagination?.totalPages ?? Math.ceil(total / limit);

  return { data: items, pagination: { page, limit, total, totalPages } };
}