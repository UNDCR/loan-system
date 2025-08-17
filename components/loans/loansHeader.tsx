"use client"

import { useState } from "react"
import { Search, X, Plus, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { LoanFormDialog } from "./loanForm"
import { PaymentFormDialog } from "./paymentForm"
import { FirearmFormDialog } from "./firearmForm"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { LoanStatus, LoanData } from "@/lib/types"
import { toast } from "sonner"
import { searchLoans } from "@/actions/search"
import { filterLoans } from "@/actions/filters"

export function LoansHeader({
  onStatusChange,
  onSearch,
  onSearchResults,
  className,
}: LoansHeaderProps) {
  const [status, setStatus] = useState<LoanStatus | "all">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)
  const [isFirearmOpen, setIsFirearmOpen] = useState(false)
  const [dateSort, setDateSort] = useState<"asc" | "desc">("desc")
  const [isSearching, setIsSearching] = useState(false)

  const handleStatusChange = async (value: string) => {
    const newStatus = value as LoanStatus | "all"
    setStatus(newStatus)
    onStatusChange?.(newStatus)

    if (newStatus === "all") {
      onSearchResults?.(null)
      return
    }

    try {
      setIsSearching(true)
      const mapped = await filterLoans({ status: newStatus, page: 1, limit: 20, include: "customer,firearm", sortDate: dateSort })
      onSearchResults?.(mapped.data ?? null)
    } catch {
      toast.error("Failed to filter loans by status")
      onSearchResults?.(null)
    } finally {
      setIsSearching(false)
    }
  }

  const handleDateSortChange = async (value: string) => {
    const newSort = (value === "asc" ? "asc" : "desc") as "asc" | "desc"
    setDateSort(newSort)
    if (status === "all") return
    try {
      setIsSearching(true)
      const mapped = await filterLoans({ status, page: 1, limit: 20, include: "customer,firearm", sortDate: newSort })
      onSearchResults?.(mapped.data ?? null)
    } catch {
      toast.error("Failed to apply date sort")
    } finally {
      setIsSearching(false)
    }
  }

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
      const result = await searchLoans({ full_name: query.trim() })
      if (!result.success) {
        if (result.error) toast.error(result.error)
        onSearchResults?.(null)
      } else {
        onSearchResults?.(result.data ?? [])
      }
    } catch {
      toast.error("Failed to search loans")
      onSearchResults?.(null)
    } finally {
      setIsSearching(false)
    }
  }

  const clearSearch = () => {
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
            placeholder="Search by name, quote #, invoice #, or ID number..."
            className="w-full pl-8 pr-8"
            value={searchQuery}
            onChange={handleSearch}
            aria-label="Search loans by client name, quote number, invoice number, or ID number"
            title="Search examples: 'John Doe', 'Q-2025-1010', '12345 (invoice)', '9803030527088'"
          />
          {isSearching ? (
            <div className="absolute right-2.5 top-2.5">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : (
            !!searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
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
          <Select value={status} onValueChange={handleStatusChange}>
            <SelectTrigger
              size="sm"
              aria-label="Filter by loan status"
              id="status-filter"
              disabled={isSearching}
            >
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Paid">Paid</SelectItem>
              <SelectItem value="Pending Payment">Pending Payment</SelectItem>
              <SelectItem value="Grace">Grace</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
              <SelectItem value="Penalty">Penalty</SelectItem>
            </SelectContent>
          </Select>
          <span className="ml-2 text-sm text-muted-foreground">Date</span>
          <Select value={dateSort} onValueChange={handleDateSortChange}>
            <SelectTrigger
              size="sm"
              aria-label="Sort by created date"
              id="date-sort"
              disabled={isSearching}
            >
              <SelectValue placeholder="Sort date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Newest first</SelectItem>
              <SelectItem value="asc">Oldest first</SelectItem>
            </SelectContent>
          </Select>
          {isSearching && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-label="Loading filtered loans" />
          )}
          <LoanFormDialog
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            trigger={
              <Button size="sm" variant="default" className="gap-2 rounded-full px-4">
                <Plus className="h-4 w-4" />
                Create Loan
              </Button>
            }
          />
          <FirearmFormDialog
            open={isFirearmOpen}
            onOpenChange={setIsFirearmOpen}
            onSave={() => setIsFirearmOpen(false)}
            trigger={
              <Button size="sm" variant="outline" className="px-3">
                Firearm Details
              </Button>
            }
          />
          <PaymentFormDialog
            open={isPaymentOpen}
            onOpenChange={setIsPaymentOpen}
            trigger={
              <Button size="sm" variant="secondary" className="px-3">
                Record Payment
              </Button>
            }
          />
        </div>
      </div>

    </div>
  )
}

interface LoansHeaderProps {
  onStatusChange?: (status: LoanStatus | "all") => void
  onSearch?: (query: string) => void
  onSearchResults?: (results: LoanData[] | null) => void
  className?: string
}