"use client"

import { useState, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import LoanCard from "@/components/loans/loanCard"
import { LoansHeader } from "./loansHeader"
import { Pagination } from "@/components/ui/pagination"
import { LoanData, LoanStatus, PaginationMetadata } from "@/lib/types"

interface LoansClientProps {
  loans: LoanData[]
  pagination: PaginationMetadata
  initialSearch?: string
  initialStatus?: LoanStatus | "all"
}

export function LoansClient({ loans, pagination, initialSearch, initialStatus }: LoansClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [statusFilter, setStatusFilter] = useState<LoanStatus | 'all'>(initialStatus || 'all')
  const [searchQuery, setSearchQuery] = useState(initialSearch || '')
  const [searchResults, setSearchResults] = useState<LoanData[] | null>(null)

  const filteredLoans = useMemo(() => {
    // When using server-side pagination, we use the server data directly
    // searchResults is only used for client-side search display
    return searchResults !== null ? searchResults : loans
  }, [loans, searchResults])

  const handleStatusChange = (status: LoanStatus | "all") => {
    setStatusFilter(status)

    const params = new URLSearchParams(searchParams.toString())
    if (status === "all") {
      params.delete("status")
    } else {
      params.set("status", status)
    }
    params.delete("page") // Reset to first page when changing status
    router.push(`/dashboard/loans?${params.toString()}`)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)

    const params = new URLSearchParams(searchParams.toString())
    if (!query.trim()) {
      setSearchResults(null)
      params.delete("search")
      params.delete("page") // Reset to first page when clearing search
      router.push(`/dashboard/loans?${params.toString()}`)
      return
    }

    params.set("search", query)
    params.delete("page") // Reset to first page when searching
    router.push(`/dashboard/loans?${params.toString()}`)
  }

  const handleSearchResults = (results: LoanData[] | null) => {
    setSearchResults(results)
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", String(page))
    router.push(`/dashboard/loans?${params.toString()}`)
  }

  return (
    <div className="space-y-6">
      <LoansHeader
        onStatusChange={handleStatusChange}
        onSearch={handleSearch}
        onSearchResults={handleSearchResults}
      />

      <div className="grid grid-cols-1 gap-4">
        {filteredLoans.length > 0 ? (
          filteredLoans.map((loan, index) => (
            <LoanCard key={`${loan.quoteNumber}-${index}`} loan={loan} />
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No loans found matching your filters.</p>
            {(statusFilter !== 'all' || searchQuery || searchResults) && (
              <button
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString())
                  params.delete("status")
                  params.delete("search")
                  params.delete("page")
                  router.push(`/dashboard/loans?${params.toString()}`)
                  setStatusFilter('all')
                  setSearchQuery('')
                  setSearchResults(null)
                }}
                className="mt-2 text-sm text-primary hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>
      {searchResults === null && pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          onPageChange={handlePageChange}
          className="mt-6"
        />
      )}
    </div>
  )
}