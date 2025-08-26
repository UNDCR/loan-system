"use client"

import { useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import type { StorageEntry, PaginationMetadata } from "@/lib/types"
import { StorageCard } from "@/components/storage/storageCard"
import { StorageHeader } from "@/components/storage/storageHeader"
import { CreateStorageDialog } from "@/components/storage/createStorageDialog"
import { Pagination } from "@/components/ui/pagination"
import { toast } from "sonner"

interface StorageClientProps {
  entries: StorageEntry[]
  pagination: PaginationMetadata
  initialSearch?: string
  initialStorageType?: string
  initialSort?: "asc" | "desc"
}

export function StorageClient({ entries, pagination }: StorageClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchResults, setSearchResults] = useState<StorageEntry[] | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const displayData = useMemo(() => {
    // When using server-side pagination, we use the server data directly
    // searchResults is only used for client-side search display
    return searchResults !== null ? searchResults : entries
  }, [entries, searchResults])

  const handleSearch = (query: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (!query.trim()) {
      setSearchResults(null)
      params.delete("search")
      params.delete("page") // Reset to first page when clearing search
      router.push(`/dashboard/storage?${params.toString()}`)
      return
    }

    params.set("search", query)
    params.delete("page") // Reset to first page when searching
    router.push(`/dashboard/storage?${params.toString()}`)
  }

  const handleSearchResults = (results: StorageEntry[] | null) => {
    setSearchResults(results)
  }

  const handleSortChange = (order: "asc" | "desc") => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("sort", order)
    params.delete("page") // Reset to first page when changing sort
    router.push(`/dashboard/storage?${params.toString()}`)
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", String(page))
    router.push(`/dashboard/storage?${params.toString()}`)
  }

  return (
    <div className="space-y-6">
      <StorageHeader
        sourceData={entries}
        onSearch={handleSearch}
        onSearchResults={handleSearchResults}
        onSortChange={handleSortChange}
        onAddStorageClick={() => setIsCreateOpen(true)}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
        {displayData.length ? (
          displayData.map((entry) => (
            <StorageCard
              key={entry.id}
              entry={entry}
              onDeleted={(id) => {
                // Refresh the page to get updated data from server
                router.refresh()
                setSearchResults((prev) => (prev ? prev.filter((e) => e.id !== id) : prev))
              }}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-muted-foreground">No storage entries found.</div>
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
      <CreateStorageDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onCreated={(entry) => {
          // Refresh the page to get updated data from server
          router.refresh()
          setSearchResults((prev) => (prev ? [entry, ...prev] : prev))
          toast.success("Storage entry added")
        }}
      />
    </div>
  )
}

