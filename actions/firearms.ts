"use server"

import { apiFetch } from "./api";
import type { FirearmWithRelations, EnhancedFirearmData } from "../lib/types";

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

export async function fetchFirearmsWithRelations(): Promise<EnhancedFirearmData[]> {
  const res = await apiFetch<FirearmWithRelations[]>("/firearms?include=customers,loans,storage");
  if (!res.ok || !res.data) return [];

  return res.data.map(mapFirearmToEnhanced);
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

