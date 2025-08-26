"use client"

import { useState } from "react"
import { Search, X, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { searchFirearms } from "@/actions/firearms"
import { CreateFirearmDialog } from "@/components/firearms/createFirearmDialog"
import type { EnhancedFirearmData } from "@/lib/types"

export function FirearmsHeader({ onSortChange, onSearch, onSearchResults, onFilterChange, statusFilter = "all", className }: FirearmsHeaderProps) {
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    onSearch?.(query)

    if (!query.trim()) {
      setIsSearching(false)
      onSearchResults?.(null)
      return
    }

    try {
      setIsSearching(true)
      const result = await searchFirearms(query.trim())
      if (!result.success) {
        if (result.error) toast.error(result.error)
        onSearchResults?.(null)
      } else {
        onSearchResults?.(result.data ?? [])
      }
    } catch {
      toast.error("Failed to search firearms")
      onSearchResults?.(null)
    } finally {
      setIsSearching(false)
    }
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
            aria-label="Search firearms by serial number, stock number, make/model, or customer"
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
          <span className="text-sm text-muted-foreground">Status</span>
          <Select
            value={statusFilter}
            onValueChange={(val: "all" | "booked" | "available") => {
              onFilterChange?.(val)
            }}
          >
            <SelectTrigger size="sm" aria-label="Filter by status">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="booked">Booked Out</SelectItem>
              <SelectItem value="available">Available</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">Date Added</span>
          <Select
            value={sortOrder}
            onValueChange={(val: "asc" | "desc") => {
              setSortOrder(val)
              onSortChange?.(val)
            }}
          >
            <SelectTrigger size="sm" aria-label="Sort by date added">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Newest first</SelectItem>
              <SelectItem value="asc">Oldest first</SelectItem>
            </SelectContent>
          </Select>
          <CreateFirearmDialog
            trigger={<Button size="sm">Add Firearm</Button>}
          />
        </div>
      </div>
    </div>
  )
}

interface FirearmsHeaderProps {
  onSearch?: (query: string) => void
  onSearchResults?: (results: EnhancedFirearmData[] | null) => void
  onSortChange?: (order: "asc" | "desc") => void
  onFilterChange?: (filter: "all" | "booked" | "available") => void
  statusFilter?: "all" | "booked" | "available"
  className?: string
}
