"use client"

import { useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import FirearmCard from "@/components/firearms/firearmCard"
import { FirearmsHeader } from "@/components/firearms/firearmsHeader"
import { Pagination } from "@/components/ui/pagination"
import type { EnhancedFirearmData, PaginationMetadata } from "@/lib/types"

interface FirearmsClientProps {
  firearms: EnhancedFirearmData[]
  pagination: PaginationMetadata
  initialFilter?: string
}

export function FirearmsClient({ firearms, pagination, initialFilter }: FirearmsClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const data: EnhancedFirearmData[] = firearms
  const [searchResults, setSearchResults] = useState<EnhancedFirearmData[] | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  const getInitialStatusFilter = (): "all" | "booked" | "available" => {
    if (initialFilter === "true") return "booked"
    if (initialFilter === "false") return "available"
    return "all"
  }

  const [statusFilter, setStatusFilter] = useState<"all" | "booked" | "available">(getInitialStatusFilter())

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setSearchResults(null)
      const params = new URLSearchParams(searchParams.toString())
      params.delete("page")
      router.push(`/dashboard/firearms?${params.toString()}`)
    }
  }

  const handleSearchResults = (results: EnhancedFirearmData[] | null) => {
    setSearchResults(results)
  }

  const handleFilterChange = (filter: "all" | "booked" | "available") => {
    setStatusFilter(filter)

    const params = new URLSearchParams(searchParams.toString())

    if (filter === "booked") {
      params.set("booked_out", "true")
    } else if (filter === "available") {
      params.set("booked_out", "false")
    } else {
      params.delete("booked_out")
    }

    params.delete("page")
    router.push(`/dashboard/firearms?${params.toString()}`)
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", String(page))
    router.push(`/dashboard/firearms?${params.toString()}`)
  }

  const displayData = useMemo(() => {
    return searchResults !== null ? searchResults : data
  }, [data, searchResults])

  const sorted = useMemo(() => {
    const arr = [...displayData]
    arr.sort((a, b) => {
      const da = new Date(a.dateAdded).getTime()
      const db = new Date(b.dateAdded).getTime()
      return sortOrder === "asc" ? da - db : db - da
    })
    return arr
  }, [displayData, sortOrder])

  return (
    <div className="space-y-6">
      <FirearmsHeader
        onSearch={handleSearch}
        onSearchResults={handleSearchResults}
        onSortChange={setSortOrder}
        onFilterChange={handleFilterChange}
        statusFilter={statusFilter}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
        {sorted.length ? (
          sorted.map((item, idx) => (
            <FirearmCard
              key={`${item.serialNumber}-${idx}`}
              makeModel={item.makeModel}
              stockNumber={item.stockNumber}
              serialNumber={item.serialNumber}
              dateAdded={item.dateAdded}
              isBookedOut={item.bookedOut}
              bookedOutDate={item.bookedOutDate}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No firearms found.
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
