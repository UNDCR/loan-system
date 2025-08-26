"use server"

import { apiFetch } from "./api"
import type { StorageEntry, StorageItemResponse, PaginationMetadata } from "@/lib/types"

type StorageApiItem = {
  id: string
  firearm_id: string
  customer_id: string
  storage_type: string | null
  created_at: string
  firearms: {
    id: string
    make_model: string | null
    stock_number: string | null
    serial_number: string | null
    created_at: string
    update_at: string | null
    booked_out: boolean | null
    booked_out_date: string | null
    bookin_date: string | null
    bookout_date: string | null
    customers_id: string | null
    storage_id: string | null
  } | null
  customers: {
    id: string
    full_name: string | null
    id_number: string | null
    phone_number: string | null
    email: string | null
    firearm_id: string | null
    customer_address_id: string | null
    credit_amount: number | null
    created_at: string
  } | null
}

function mapStorageItem(item: StorageItemResponse): StorageEntry {
  return {
    id: item.id,
    storageType: item.storage_type ?? "",
    bookedInDate: item.booked_in_date,
    bookedOutDate: item.booked_out_date,
    firearm: item.firearm
      ? {
          id: item.firearm.id,
          makeModel: item.firearm.make_model ?? "",
          stockNumber: item.firearm.stock_number ?? "",
          serialNumber: item.firearm.serial_number ?? "",
          createdAt: item.firearm.created_at,
          bookedOut: item.firearm.booked_out ?? false,
          bookedOutDate: item.firearm.booked_out_date,
        }
      : null,
    customer: item.customer
      ? {
          id: item.customer.id,
          name: item.customer.full_name ?? "",
          idNumber: item.customer.id_number ?? "",
          phoneNumber: item.customer.phone_number ?? "",
          email: item.customer.email ?? "",
        }
      : null,
    loan: item.loan
      ? {
          id: item.loan.id,
          quoteNumber: item.loan.quote_number ?? null,
          invoiceNumber: item.loan.invoice_number ?? null,
          startDate: item.loan.start_date,
          status: item.loan.status ?? null,
        }
      : null,
  }
}

function mapStorageItemFromListApi(item: StorageApiItem): StorageEntry {
  const firearm = item.firearms
  const customer = item.customers
  return {
    id: item.id,
    storageType: item.storage_type ?? "",
    bookedInDate: firearm?.bookin_date ?? item.created_at,
    bookedOutDate: firearm?.bookout_date ?? null,
    firearm: firearm
      ? {
          id: firearm.id,
          makeModel: firearm.make_model ?? "",
          stockNumber: firearm.stock_number ?? "",
          serialNumber: firearm.serial_number ?? "",
          createdAt: firearm.created_at,
          bookedOut: firearm.booked_out ?? false,
          bookedOutDate: firearm.booked_out_date ?? null,
        }
      : null,
    customer: customer
      ? {
          id: customer.id,
          name: customer.full_name ?? "",
          idNumber: customer.id_number ?? "",
          phoneNumber: customer.phone_number ?? "",
          email: customer.email ?? "",
        }
      : null,
    loan: null,
  }
}

export async function fetchStorageEntries(params?: {
  page?: number;
  limit?: number;
  search?: string;
  storage_type?: string;
  sort?: "asc" | "desc"
}): Promise<{ data: StorageEntry[]; pagination: PaginationMetadata }> {
  const qs: string[] = []
  if (params?.page) qs.push(`page=${params.page}`)
  if (params?.limit) qs.push(`limit=${params.limit}`)
  if (params?.search) qs.push(`search=${encodeURIComponent(params.search)}`)
  if (params?.storage_type) qs.push(`storage_type=${encodeURIComponent(params.storage_type)}`)
  if (params?.sort) qs.push(`sort=${params.sort}`)
  const query = qs.length ? `?${qs.join("&")}` : ""

  const res = await apiFetch<StorageApiItem[] | { data: StorageApiItem[]; pagination?: PaginationMetadata }>(`/storage${query}`)

  // Handle both array response and paginated response formats
  let storageItems: StorageApiItem[] = []
  let pagination: PaginationMetadata

  if (res.ok && res.data) {
    if (Array.isArray(res.data)) {
      // Direct array response - calculate pagination based on returned data
      storageItems = res.data
      const page = params?.page ?? 1
      const limit = params?.limit ?? 20
      const hasNextPage = storageItems.length === limit
      const estimatedTotal = hasNextPage ? page * limit + 1 : (page - 1) * limit + storageItems.length

      pagination = {
        page,
        limit,
        total: estimatedTotal,
        totalPages: hasNextPage ? page + 1 : page
      }
    } else {
      // Paginated response format
      const apiResponse = res.data as { data: StorageApiItem[]; pagination?: PaginationMetadata }
      storageItems = apiResponse.data || []
      pagination = apiResponse.pagination || {
        page: params?.page ?? 1,
        limit: params?.limit ?? 20,
        total: storageItems.length,
        totalPages: Math.ceil(storageItems.length / (params?.limit ?? 20))
      }
    }
  } else {
    storageItems = []
    pagination = {
      page: params?.page ?? 1,
      limit: params?.limit ?? 20,
      total: 0,
      totalPages: 0
    }
  }

  return { data: storageItems.map(mapStorageItemFromListApi), pagination }
}

export async function fetchStorageById(id: string): Promise<StorageEntry | null> {
  const res = await apiFetch<StorageItemResponse>(`/storage/${encodeURIComponent(id)}?include=firearm,customer`)
  if (!res.ok || !res.data) return null
  return mapStorageItem(res.data)
}

export type CreateStoragePayload = {
  firearm_id: string
  customer_id: string
  storage_type: string
  bookin_date: string
  bookout_date: string
}

export async function createStorageEntry(payload: CreateStoragePayload): Promise<{ success: true; data: StorageEntry } | { success: false; error?: string }> {
  const res = await apiFetch<StorageItemResponse>(`/storage`, {
    method: "POST",
    body: JSON.stringify(payload),
  })
  if (!res.ok || !res.data) {
    return { success: false, error: res.error }
  }
  const mapped = mapStorageItem(res.data)
  try {
    const full = await fetchStorageById(mapped.id)
    if (full) {
      return { success: true, data: full }
    }
  } catch {
    
  }
  return { success: true, data: mapped }
}


export async function deleteStorageEntry(id: string, bookout_date?: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await apiFetch(`/storage/${encodeURIComponent(id)}`, {
      method: "DELETE",
      body: bookout_date ? JSON.stringify({ bookout_date }) : undefined,
    })
    if (!res.ok) return { success: false, error: res.error }
    return { success: true }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Request failed" }
  }
}

