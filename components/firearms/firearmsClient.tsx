"use client"

import { useMemo, useState } from "react"
import FirearmCard from "@/components/firearms/firearmCard"
import { FirearmsHeader } from "@/components/firearms/firearmsHeader"
import type { EnhancedFirearmData } from "@/lib/types"

export function FirearmsClient({ firearms }: { firearms: EnhancedFirearmData[] }) {
  const data: EnhancedFirearmData[] = firearms
  const [searchResults, setSearchResults] = useState<EnhancedFirearmData[] | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  const handleSearch = (query: string) => {
    if (!query.trim()) setSearchResults(null)
  }

  const handleSearchResults = (results: EnhancedFirearmData[] | null) => {
    setSearchResults(results)
  }

  const filtered = useMemo(() => {
    return searchResults !== null ? searchResults : data
  }, [data, searchResults])

  const sorted = useMemo(() => {
    const arr = [...filtered]
    arr.sort((a, b) => {
      const da = new Date(a.dateAdded).getTime()
      const db = new Date(b.dateAdded).getTime()
      return sortOrder === "asc" ? da - db : db - da
    })
    return arr
  }, [filtered, sortOrder])

  return (
    <div className="space-y-6">
      <FirearmsHeader
        onSearch={handleSearch}
        onSearchResults={handleSearchResults}
        onSortChange={setSortOrder}
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
    </div>
  )
}
