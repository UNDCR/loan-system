"use server"

import { apiFetch } from "./api";
import { mapLoanToLoanData } from "@/lib/mappers/loan";
import type { EnrichedLoan, LoanData, LoanStatus } from "@/lib/types";

export type FilterLoansParams = {
  status?: LoanStatus; // optional to allow date-only ordering
  page?: number;
  limit?: number;
  include?: string;
  sortDate?: "asc" | "desc";
};

export type Paginated<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export async function filterLoans(params: FilterLoansParams): Promise<Paginated<LoanData>> {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  query.set("include", params.include ?? "customer,firearm");
  if (params.sortDate) query.set("date_order", params.sortDate);

  const res = await apiFetch<EnrichedLoan[]>(`/filters/loan?${query.toString()}`);
  const rows: EnrichedLoan[] = res.ok && res.data ? res.data : [];
  const data = rows.map(mapLoanToLoanData);
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  return {
    data,
    pagination: {
      page,
      limit,
      total: data.length,
      totalPages: Math.ceil(data.length / limit) || 0,
    },
  };
}

export async function filterLoansRaw(params: FilterLoansParams): Promise<Paginated<EnrichedLoan>> {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  query.set("include", params.include ?? "customer,firearm");
  if (params.sortDate) query.set("date_order", params.sortDate);

  const res = await apiFetch<EnrichedLoan[]>(`/filters/loan?${query.toString()}`);
  const rows: EnrichedLoan[] = res.ok && res.data ? res.data : [];
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  return {
    data: rows,
    pagination: {
      page,
      limit,
      total: rows.length,
      totalPages: Math.ceil(rows.length / limit) || 0,
    },
  };
}
