"use server"

import { apiFetch } from "./api";
import type { ClientData, CreateClientData, CustomerRow, SubmitClientFormData } from "@/lib/types";

export async function submitClientForm(clientData: SubmitClientFormData): Promise<{ success: boolean; error?: string }> {
  try {
    const { id, ...clientDataForApi } = clientData;
    const response = await apiFetch<ClientData>(`/customers/${id}`, {
      method: "PUT",
      body: JSON.stringify(clientDataForApi),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return {
        success: false,
        error: response.error || "Failed to submit client form"
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error submitting client form:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred"
    };
  }
}

export async function createClient(clientData: CreateClientData): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await apiFetch<ClientData>("/customers", {
      method: "POST",
      body: JSON.stringify(clientData),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return {
        success: false,
        error: response.error || "Failed to create client"
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error creating client:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred"
    };
  }
}

export interface UpdateClientData extends Omit<CreateClientData, 'id_number'> {
  id: string;
  address?: {
    streetName?: string;
    town?: string;
    province?: string;
    postalCode?: string;
    country?: string;
  };
}

export async function updateClient(clientData: UpdateClientData): Promise<{ success: boolean; error?: string }> {
  try {
    const { id, address, ...updateData } = clientData;

    const requestData = {
      ...updateData,
      ...(address || {})
    };

    const response = await apiFetch<ClientData>(`/customers/${id}`, {
      method: "PUT",
      body: JSON.stringify(requestData),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return {
        success: false,
        error: response.error || "Failed to update client"
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating client:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred"
    };
  }
}

export async function fetchClients(params?: { page?: number; limit?: number; search?: string; sortCredit?: "asc" | "desc" }): Promise<{ data: ClientData[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.search) query.set("search", params.search);
  const base = "/customers";
  const suffix = query.size ? `?${query.toString()}&include=address` : `?include=address`;
  const [customersRes, loansRes] = await Promise.all([
    apiFetch<CustomerRow[]>(`${base}${suffix}`),
    apiFetch<{ id: string; customer_id: string | null }[]>("/loans"),
  ]);

  const customers = customersRes.ok && customersRes.data ? customersRes.data : [];
  const pagination = { page: params?.page ?? 1, limit: params?.limit ?? 50, total: customers.length, totalPages: Math.ceil(customers.length / (params?.limit ?? 50)) };
  const loans = loansRes.ok && loansRes.data ? loansRes.data : [];
  const counts = new Map<string, number>();
  for (const l of loans) {
    if (!l.customer_id) continue;
    counts.set(l.customer_id, (counts.get(l.customer_id) ?? 0) + 1);
  }
  let data: ClientData[] = customers.map((c: CustomerRow) => ({
    id: c.id,
    fullName: c.full_name ?? "",
    email: c.email ?? "",
    phoneNumber: c.phone_number ?? "",
    idNumber: c.id_number ?? "",
    loansCount: counts.get(c.id) ?? 0,
    creditAmount: c.credit_amount ?? 0,
    address: (() => {
      const addr = c.address ?? c.customer_address ?? null;
      if (!addr) return undefined;
      return {
        id: addr.id,
        streetName: addr.street_name,
        town: addr.town,
        province: addr.province,
        postalCode: addr.postal_code,
        country: addr.country,
      };
    })()
  }));

  if (params?.sortCredit) {
    const order = params.sortCredit;
    data = [...data].sort((a, b) => {
      const av = a.creditAmount ?? 0;
      const bv = b.creditAmount ?? 0;
      return order === "asc" ? av - bv : bv - av;
    });
  }
  return { data, pagination };
}