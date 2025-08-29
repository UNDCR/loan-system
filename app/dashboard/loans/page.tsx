import { Metadata } from "next"
import { LoansClient } from "@/components/loans/loanClient";
import { fetchLoans } from "@/actions/loans";
import { LoanStatus } from "@/lib/types";

export const metadata: Metadata = {
  title: "Loans | Firearm Firearm Studio",
  description: "Manage and track all firearm loans in one place",
};

interface LoansPageProps {
  searchParams: Promise<{
    page?: string
    limit?: string
    search?: string
    status?: LoanStatus | "all"
  }>
}

export default async function LoansPage({ searchParams }: LoansPageProps) {
  const params = await searchParams

  const page = params.page ? parseInt(params.page, 10) : 1
  const limit = params.limit ? parseInt(params.limit, 10) : 20
  const search = params.search || undefined
  const status = params.status && params.status !== "all" ? params.status as LoanStatus : undefined

  const { data: loans, pagination } = await fetchLoans({
    page,
    limit,
    customer_search: search,
    status
  })

  return (
    <LoansClient
      loans={loans}
      pagination={pagination}
      initialSearch={search}
      initialStatus={params.status || "all"}
    />
  )
}
