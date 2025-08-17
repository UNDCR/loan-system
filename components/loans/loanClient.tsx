"use client"

import { useState, useMemo } from "react"
import LoanCard from "@/components/loans/loanCard"
import { LoansHeader } from "./loansHeader"
import { LoanData, LoanStatus } from "@/lib/types"

export function LoansClient({ loans }: LoansClientProps) {
  const [statusFilter, setStatusFilter] = useState<LoanStatus | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<LoanData[] | null>(null)

  const filteredLoans = useMemo(() => {
    const loansToFilter = searchResults ?? loans

    return loansToFilter.filter(loan => {
      if (statusFilter !== 'all' && loan.status !== statusFilter) {
        return false
      }
      return true
    })
  }, [loans, searchResults, statusFilter])

  return (
    <div className="space-y-6">
      <LoansHeader
        onStatusChange={setStatusFilter}
        onSearch={setSearchQuery}
        onSearchResults={setSearchResults}
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
    </div>
  )
}

interface LoansClientProps {
  loans: LoanData[]
}