"use server";

import { apiFetch } from "./api";
import { fetchClients } from "./clients";
import { mapLoanToLoanData } from "@/lib/mappers/loan";
import type {
  ClientData,
  LoanData,
  EnrichedLoan,
  SearchCriteria,
  SearchResult,
} from "@/lib/types";
import type { FirearmWithRelations } from "@/lib/types";

type BackendSearchRow = {
  loan_id: string;
  quote_number: string | null;
  invoice_number: string | null;
  customer_id: string | null;
  full_name: string | null;
  phone_number: string | null;
  email: string | null;
  id_number: string | null;
  serial_number: string | null;
  stock_number: string | null;
  firearms_id?: string | null;
};

export async function searchClients(criteria: SearchCriteria): Promise<SearchResult<ClientData>> {
  try {
    const term = (criteria.full_name ?? criteria.id_number ?? "").trim();
    if (!term) return { success: true, data: [] };

    const { data } = await fetchClients({ page: 1, limit: 50, search: term });
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to search clients" };
  }
}

export async function searchLoans(criteria: SearchCriteria): Promise<SearchResult<LoanData>> {
  try {
    const term = (criteria.full_name ?? criteria.id_number ?? criteria.quote_number ?? criteria.invoice_number ?? "").trim();
    if (!term) return { success: true, data: [] };

    const res = await apiFetch<BackendSearchRow[]>(`/search?q=${encodeURIComponent(term)}`);
    if (!res.ok) return { success: false, error: res.error };

    const rows = res.data ?? [];
    const loanIds = new Set<string>();
    const firearmIdsNeedingLookup = new Set<string>();
    const customerIdsNeedingLookup = new Set<string>();

    for (const r of rows) {
      if (r.loan_id) {
        loanIds.add(r.loan_id);
      } else if (r.firearms_id) {
        firearmIdsNeedingLookup.add(r.firearms_id);
      } else if (r.customer_id) {
        customerIdsNeedingLookup.add(r.customer_id);
      }
    }

    const loansFromLoanIds = await Promise.all(
      Array.from(loanIds).map(async (id) => {
        const loanRes = await apiFetch<EnrichedLoan>(`/loans/${id}?include=customer,firearm`);
        return loanRes.ok ? loanRes.data ?? null : null;
      })
    );

    const loansFromFirearms = await Promise.all(
      Array.from(firearmIdsNeedingLookup).map(async (fid) => {
        const firearmRes = await apiFetch<FirearmWithRelations>(`/firearms/${encodeURIComponent(fid)}?include=customers,loans`);
        if (!firearmRes.ok || !firearmRes.data) return [] as EnrichedLoan[];
        const firearm = firearmRes.data;
        type FRLoan = NonNullable<FirearmWithRelations["loans"]>[number];
        const enrichedLoans: EnrichedLoan[] = (firearm.loans ?? []).map((ln: FRLoan) => ({
          id: ln.id,
          customer_id: ln.customer?.id ?? null,
          quote_number: ln.quote_number,
          firearm_cost: ln.firearm_cost,
          deposit_amount: ln.deposit_amount,
          loan_amount: ln.loan_amount,
          remain_amount: ln.remain_amount,
          duration: ln.duration,
          interest: ln.interest,
          start_date: ln.start_date,
          status: ln.status,
          invoice_number: ln.invoice_number,
          customer: ln.customer
            ? {
              id: ln.customer.id,
              full_name: ln.customer.full_name ?? "",
              email: ln.customer.email ?? "",
              phone_number: ln.customer.phone_number ?? "",
              id_number: ln.customer.id_number ?? "",
            }
            : null,
          firearms: {
            id: firearm.id,
            make_model: firearm.make_model ?? null,
            stock_number: firearm.stock_number ?? null,
            serial_number: firearm.serial_number ?? null,
          },
        }));
        return enrichedLoans;
      })
    );

    const loansFromCustomers = await Promise.all(
      Array.from(customerIdsNeedingLookup).map(async (cid) => {
        const listRes = await apiFetch<EnrichedLoan[]>(`/loans?include=customer,firearm&customer_search=${encodeURIComponent(cid)}`);
        if (!listRes.ok || !listRes.data) return [] as EnrichedLoan[];
        return listRes.data;
      })
    );

    const mergedLoans = [
      ...loansFromLoanIds.filter((l): l is EnrichedLoan => l !== null),
      ...loansFromFirearms.flat(),
      ...loansFromCustomers.flat(),
    ];

    const uniqueById = new Map<string, EnrichedLoan>();
    for (const l of mergedLoans) {
      if (l && l.id) uniqueById.set(l.id, l);
    }

    const data = Array.from(uniqueById.values()).map(mapLoanToLoanData);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to search loans" };
  }
}

export async function searchLoansByClient(clientName: string): Promise<SearchResult<LoanData>> {
  return searchLoans({ full_name: clientName });
}

export async function searchClientsByName(name: string): Promise<SearchResult<ClientData>> {
  return searchClients({ full_name: name });
}

export async function searchClientsByIdNumber(idNumber: string): Promise<SearchResult<ClientData>> {
  return searchClients({ id_number: idNumber });
}

export async function searchLoansByQuote(quoteNumber: string): Promise<SearchResult<LoanData>> {
  return searchLoans({ quote_number: quoteNumber });
}

export async function searchLoansByIdNumber(idNumber: string): Promise<SearchResult<LoanData>> {
  return searchLoans({ id_number: idNumber });
}

export async function searchClientsByPhone(phoneNumber: string): Promise<SearchResult<ClientData>> {
  return searchClients({ full_name: phoneNumber });
}

export async function searchLoansIntelligent(searchTerm: string): Promise<SearchResult<LoanData>> {
  return searchLoans({ full_name: searchTerm });
}

export async function searchClientsIntelligent(searchTerm: string): Promise<SearchResult<ClientData>> {
  return searchClients({ full_name: searchTerm });
}