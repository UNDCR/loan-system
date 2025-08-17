"use client"

import { useState } from "react"
import { Search, X, Plus, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type { StorageEntry } from "@/lib/types"

interface StorageHeaderProps {
  onSearch?: (query: string) => void
  onSearchResults?: (results: StorageEntry[] | null) => void
  onAddStorageClick?: () => void
  onSortChange?: (order: "asc" | "desc") => void
  sourceData?: StorageEntry[]
  className?: string
}

export function StorageHeader({ onSearch, onSearchResults, onAddStorageClick, onSortChange, sourceData = [], className }: StorageHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    onSearch?.(query)

    if (!query.trim()) {
      setIsSearching(false)
      onSearchResults?.(null)
      return
    }

    setIsSearching(true)
    // Client-side filter: serial, stock, make/model, customer name/id
    const lower = query.trim().toLowerCase()
    const results = sourceData.filter((item) => {
      const f = item.firearm
      const c = item.customer
      return (
        (f?.serialNumber?.toLowerCase().includes(lower) ?? false) ||
        (f?.stockNumber?.toLowerCase().includes(lower) ?? false) ||
        (f?.makeModel?.toLowerCase().includes(lower) ?? false) ||
        (c?.name?.toLowerCase().includes(lower) ?? false) ||
        (c?.idNumber?.toLowerCase().includes(lower) ?? false)
      )
    })
    onSearchResults?.(results)
    setIsSearching(false)
  }

  const clear = () => {
    setSearchQuery("")
    onSearch?.("")
    onSearchResults?.(null)
  }

  return (
    <div className={cn("pt-10", className)}>
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by serial #, stock #, make/model, or customer..."
            className="w-full pl-8 pr-8"
            value={searchQuery}
            onChange={handleSearch}
            aria-label="Search storage by serial number, stock number, make/model, or customer"
            title="Search examples: 'STK-1010', 'GLK 43X', 'Jane Doe', '8001015009087'"
          />
          {isSearching ? (
            <div className="absolute right-2.5 top-2.5">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : (
            !!searchQuery && (
              <button
                type="button"
                onClick={clear}
                aria-label="Clear search"
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )
          )}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Booked In</span>
          <Select
            value={sortOrder}
            onValueChange={(val: "asc" | "desc") => {
              setSortOrder(val)
              onSortChange?.(val)
            }}
          >
            <SelectTrigger size="sm" aria-label="Sort by booked in date">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Newest first</SelectItem>
              <SelectItem value="asc">Oldest first</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" variant="default" className="gap-2 rounded-full px-4" onClick={onAddStorageClick}>
            <Plus className="h-4 w-4" />
            Add Storage
          </Button>
        </div>
      </div>
    </div>
  )
}
