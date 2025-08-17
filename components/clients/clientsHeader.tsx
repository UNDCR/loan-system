"use client"

import { useState } from "react"
import { Search, X, Plus, Loader2, UserPlus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { AddCreditDialog } from "@/components/clients/addCreditDialog"
import { CreateClientDialog } from "@/components/clients/createClientDialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function ClientsHeader({ onSearch, onSortChange, className, onAddCredit, onCreditSuccess, onClientCreated, isSearching = false, searchQuery = "" }: ClientsHeaderProps) {
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    onSearch?.(query)
  }

  const clear = () => {
    onSearch?.("")
  }

  return (
    <div className={cn("pt-10", className)}>
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by Name or ID number"
            className="w-full pl-8 pr-8"
            value={searchQuery}
            onChange={handleSearch}
            aria-label="Search clients by name or ID number"
            title="Search examples: 'John Doe', '9803030527088'"
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
          <span className="text-sm text-muted-foreground">Credit</span>
          <Select
            value={sortOrder}
            onValueChange={(val: "asc" | "desc") => {
              setSortOrder(val)
              onSortChange?.(val)
            }}
          >
            <SelectTrigger size="sm" aria-label="Sort by credit amount">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Highest first</SelectItem>
              <SelectItem value="asc">Lowest first</SelectItem>
            </SelectContent>
          </Select>
          <CreateClientDialog
            onClientCreated={() => {
              if (onClientCreated) {
                onClientCreated();
              } else if (onSearch && searchQuery) {
                onSearch(searchQuery);
              }
            }}
            trigger={
              <Button size="sm" variant="default" className="gap-2 rounded-full px-4">
                <UserPlus className="h-4 w-4" />
                New Client
              </Button>
            }
          />
          <AddCreditDialog
            onSubmit={(payload) => onAddCredit?.(payload)}
            onSuccess={onCreditSuccess}
            trigger={
              <Button size="sm" variant="outline" className="px-3">
                <Plus className="mr-2 h-4 w-4" />
                Add Credit
              </Button>
            }
          />
        </div>
      </div>
    </div>
  )
}

interface ClientsHeaderProps {
  onSearch?: (query: string) => void
  onSortChange?: (order: "asc" | "desc") => void
  className?: string
  onAddCredit?: (payload: { idNumber: string; amount: number }) => void
  onCreditSuccess?: () => void
  onClientCreated?: () => void
  isSearching?: boolean
  searchQuery?: string
}
