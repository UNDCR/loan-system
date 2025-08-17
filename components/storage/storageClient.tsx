"use client"

import { useEffect, useMemo, useState } from "react"
import type { StorageEntry } from "@/lib/types"
import { StorageCard } from "@/components/storage/storageCard"
import { StorageHeader } from "@/components/storage/storageHeader"
import { CreateStorageDialog } from "@/components/storage/createStorageDialog"
import { toast } from "sonner"

export function StorageClient({ entries }: { entries: StorageEntry[] }) {
  const [data, setData] = useState<StorageEntry[]>(() => entries)
  const [searchResults, setSearchResults] = useState<StorageEntry[] | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const filtered = useMemo(() => (searchResults !== null ? searchResults : data), [data, searchResults])

  const sorted = useMemo(() => {
    const arr = [...filtered]
    arr.sort((a, b) => {
      const da = new Date(a.bookedInDate ?? a.firearm?.createdAt ?? 0).getTime()
      const db = new Date(b.bookedInDate ?? b.firearm?.createdAt ?? 0).getTime()
      return sortOrder === "asc" ? da - db : db - da
    })
    return arr
  }, [filtered, sortOrder])

  useEffect(() => {
    setData(entries)
  }, [entries])

  return (
    <div className="space-y-6">
      <StorageHeader
        sourceData={data}
        onSearch={() => {}}
        onSearchResults={setSearchResults}
        onSortChange={setSortOrder}
        onAddStorageClick={() => setIsCreateOpen(true)}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
        {sorted.length ? (
          sorted.map((entry) => (
            <StorageCard
              key={entry.id}
              entry={entry}
              onDeleted={(id) => {
                setData((prev) => prev.filter((e) => e.id !== id))
                setSearchResults((prev) => (prev ? prev.filter((e) => e.id !== id) : prev))
              }}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-muted-foreground">No storage entries found.</div>
        )}
      </div>
      <CreateStorageDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onCreated={(entry) => {
          setData((prev) => [entry, ...prev])
          setSearchResults((prev) => (prev ? [entry, ...prev] : prev))
          toast.success("Storage entry added")
        }}
      />
    </div>
  )
}

