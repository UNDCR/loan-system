"use server"

import { apiFetch } from "./api";
import type { FirearmWithRelations, EnhancedFirearmData, PaginatedResponse, PaginationParams, PaginationMetadata } from "../lib/types";

function mapFirearmToEnhanced(firearm: FirearmWithRelations): EnhancedFirearmData {
  return {
    id: firearm.id,
    makeModel: firearm.make_model ?? "",
    stockNumber: firearm.stock_number ?? "",
    serialNumber: firearm.serial_number ?? "",
    dateAdded: firearm.created_at,
    bookedOut: firearm.booked_out ?? false,
    bookedOutDate: firearm.booked_out_date,
    customers: (firearm.customers || []).map(customer => ({
      id: customer.id,
      name: customer.full_name ?? "",
      idNumber: customer.id_number ?? "",
      phoneNumber: customer.phone_number ?? "",
      email: customer.email ?? "",
      address: customer.address ? {
        streetName: customer.address.street_name ?? "",
        town: customer.address.town ?? "",
        province: customer.address.province ?? "",
        postalCode: customer.address.postal_code ?? "",
        country: customer.address.country ?? "",
      } : null,
    })),
    storage: firearm.storage ? {
      id: firearm.storage.id,
      storageType: firearm.storage.storage_type ?? "",
      credit: firearm.storage.credit ?? "",
    } : null,
    loans: (firearm.loans || []).map(loan => ({
      id: loan.id,
      firearmCost: loan.firearm_cost,
      quoteNumber: loan.quote_number,
      loanAmount: loan.loan_amount,
      duration: loan.duration,
      interest: loan.interest,
      remainAmount: loan.remain_amount,
      depositAmount: loan.deposit_amount,
      startDate: loan.start_date,
      status: loan.status,
      completed: loan.completed,
      invoiceNumber: loan.invoice_number,
      customer: loan.customer ? {
        id: loan.customer.id,
        name: loan.customer.full_name ?? "",
        idNumber: loan.customer.id_number ?? "",
        phoneNumber: loan.customer.phone_number ?? "",
        email: loan.customer.email ?? "",
      } : null,
      payment: loan.loan_payment ? {
        id: loan.loan_payment.id,
        amount: loan.loan_payment.payment_amount,
        type: loan.loan_payment.payment_type,
        date: loan.loan_payment.payment_date,
      } : null,
      penalty: loan.penalty ? {
        id: loan.penalty.id,
        amount: loan.penalty.penaltie_amount,
        dateApplied: loan.penalty.date_applied,
        reason: loan.penalty.reason,
      } : null,
    })),
  };
}

export type FirearmFilter = { booked_out?: boolean };

export interface FirearmFetchParams extends PaginationParams {
  filter?: FirearmFilter;
  search?: string;
}

export async function fetchFirearmsWithRelations(filter?: FirearmFilter): Promise<EnhancedFirearmData[]> {
  const params = new URLSearchParams({ include: "customers,loans,storage" });
  if (typeof filter?.booked_out === "boolean") {
    params.set("booked_out", String(filter.booked_out));
  }
  const res = await apiFetch<FirearmWithRelations[]>(`/firearms?${params.toString()}`);
  if (!res.ok || !res.data) return [];

  return res.data.map(mapFirearmToEnhanced);
}

export async function fetchFirearmsPaginated(params?: FirearmFetchParams): Promise<PaginatedResponse<EnhancedFirearmData>> {
  const searchParams = new URLSearchParams({ include: "customers,loans,storage" });

  const page = params?.page ?? 1;
  const limit = params?.limit ?? 20;

  searchParams.set("page", String(page));
  searchParams.set("limit", String(limit));

  if (params?.search) searchParams.set("search", params.search);
  if (typeof params?.filter?.booked_out === "boolean") {
    searchParams.set("booked_out", String(params.filter.booked_out));
  }

  const res = await apiFetch<FirearmWithRelations[] | { data: FirearmWithRelations[]; pagination?: PaginationMetadata }>(`/firearms?${searchParams.toString()}`);

  if (!res.ok || !res.data) {
    return {
      data: [],
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 0
      }
    };
  }

  const apiResponse = res.data;

  if (Array.isArray(apiResponse)) {
    const firearms = apiResponse as FirearmWithRelations[];

    const hasNextPage = firearms.length === limit;
    const estimatedTotal = hasNextPage
      ? page * limit + 1
      : (page - 1) * limit + firearms.length;

    return {
      data: firearms.map(mapFirearmToEnhanced),
      pagination: {
        page,
        limit,
        total: estimatedTotal,
        totalPages: hasNextPage ? page + 1 : page
      }
    };
  }

  const firearms = apiResponse.data || [];
  const pagination = apiResponse.pagination || {
    page,
    limit,
    total: firearms.length,
    totalPages: Math.ceil(firearms.length / limit)
  };

  return {
    data: firearms.map(mapFirearmToEnhanced),
    pagination
  };
}

export async function searchFirearms(term: string): Promise<{ success: true; data: EnhancedFirearmData[] } | { success: false; error?: string }> {
  try {
    const query = term.trim();
    if (!query) return { success: true, data: [] } as const;
    const res = await apiFetch<FirearmWithRelations[]>(`/firearms?include=customers,loans,storage&search=${encodeURIComponent(query)}`);
    if (!res.ok || !res.data) return { success: false, error: res.error } as const;
    return { success: true, data: res.data.map(mapFirearmToEnhanced) } as const;
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Request failed" } as const;
  }
}

export async function bookOutFirearm(firearmId: string, invoiceNumber: string): Promise<{ success: true; data: EnhancedFirearmData } | { success: false; error?: string }> {
  try {
    const res = await apiFetch<FirearmWithRelations>(`/firearms/${encodeURIComponent(firearmId)}`, {
      method: "PUT",
      body: JSON.stringify({ booked_out: true, booked_out_date: new Date().toISOString(), invoice_number: invoiceNumber }),
    });
    if (!res.ok || !res.data) return { success: false, error: res.error } as const;
    return { success: true, data: mapFirearmToEnhanced(res.data) } as const;
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Request failed" } as const;
  }
}

export async function bookInFirearm(firearmId: string): Promise<{ success: true; data: EnhancedFirearmData } | { success: false; error?: string }> {
  try {
    const res = await apiFetch<FirearmWithRelations>(`/firearms/${encodeURIComponent(firearmId)}`, {
      method: "PUT",
      body: JSON.stringify({ booked_out: false, booked_out_date: null }),
    });
    if (!res.ok || !res.data) return { success: false, error: res.error } as const;
    return { success: true, data: mapFirearmToEnhanced(res.data) } as const;
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Request failed" } as const;
  }
}

export async function createFirearm(firearmData: { make_model: string; stock_number: string; serial_number: string; booked_out: boolean; booked_out_date: string | null; customers_id: string; loans_id?: string }): Promise<{ success: boolean; error?: string; data?: { id: string } }> {
  try {
    const res = await apiFetch<{ id: string }>("/firearms", {
      method: "POST",
      body: JSON.stringify(firearmData),
    });
    if (!res.ok) return { success: false, error: res.error };
    return { success: true, data: res.data };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Request failed" };
  }
}

export async function updateFirearm(firearmId: string, firearmData: Partial<{ make_model: string; stock_number: string; serial_number: string; booked_out: boolean }>): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await apiFetch<FirearmWithRelations>(`/firearms/${encodeURIComponent(firearmId)}`, {
      method: "PUT",
      body: JSON.stringify(firearmData),
    });
    if (!res.ok) return { success: false, error: res.error };
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Request failed" };
  }
}

export async function deleteFirearm(firearmId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await apiFetch(`/firearms/${encodeURIComponent(firearmId)}`, {
      method: "DELETE",
    });
    if (!res.ok) return { success: false, error: res.error };
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Request failed" };
  }
}

export async function createBasicFirearm(payload: { make_model: string; stock_number: string; serial_number: string }): Promise<{ success: true; data: { id: string } } | { success: false; error?: string }> {
  try {
    const res = await apiFetch<{ id: string }>("/firearms", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (!res.ok || !res.data) return { success: false, error: res.error } as const;
    return { success: true, data: res.data } as const;
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Request failed" } as const;
  }
}

