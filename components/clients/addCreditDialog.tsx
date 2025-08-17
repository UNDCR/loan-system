"use client"

import { useMemo, useState, useEffect } from "react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ClientData } from "@/lib/types"
import { Search, User, IdCard, Check, Plus, Banknote, CreditCard, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { addCreditPayment } from "@/actions/payments"
import { searchClientsIntelligent } from "@/actions/search"

export interface AddCreditDialogProps {
  onSubmit?: (payload: { idNumber: string; amount: number }) => void
  onSuccess?: () => void
  trigger?: React.ReactNode
  className?: string
}

export function AddCreditDialog({ onSubmit, onSuccess, trigger, className }: AddCreditDialogProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [selectedId, setSelectedId] = useState<string>("")
  const [amount, setAmount] = useState<string>("")
  const [paymentType, setPaymentType] = useState<"EFT" | "Cash" | "Card">("EFT")
  const [submitting, setSubmitting] = useState(false)
  const [searchResults, setSearchResults] = useState<ClientData[]>([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      const trimmedQuery = query.trim()
      if (!trimmedQuery) {
        setSearchResults([])
        setSearchError(null)
        return
      }

      if (trimmedQuery.length < 2) {
        setSearchResults([])
        setSearchError(null)
        return
      }

      setSearching(true)
      setSearchError(null)

      try {
        const result = await searchClientsIntelligent(trimmedQuery)
        if (result.success) {
          setSearchResults(result.data || [])
        } else {
          setSearchError(result.error || "Failed to search clients")
          setSearchResults([])
        }
      } catch {
        setSearchError("An error occurred while searching")
        setSearchResults([])
      } finally {
        setSearching(false)
      }
    }, 300) // 300ms debounce

    return () => clearTimeout(timeoutId)
  }, [query])

  const selectedClient = useMemo(() => searchResults.find(c => c.idNumber === selectedId), [searchResults, selectedId])

  const validAmount = useMemo(() => {
    const num = Number(amount)
    return Number.isFinite(num) && num > 0
  }, [amount])

  const resetForm = () => {
    setQuery("")
    setSelectedId("")
    setAmount("")
    setPaymentType("EFT")
    setSearchResults([])
    setSearchError(null)
    setSearching(false)
  }

  const handleConfirm = async () => {
    if (!selectedId || !validAmount || !selectedClient?.id) return

    if (!["EFT", "Cash", "Card"].includes(paymentType)) {
      toast.error("Invalid payment type selected")
      return
    }

    setSubmitting(true)
    try {
      const result = await addCreditPayment({
        customers_id: selectedClient.id,
        amount: Number(amount),
        payment_type: paymentType
      })

      if (result.success) {
        toast.success(
          result.data?.message ??
            `Successfully added ${Number(result.data?.amount_credited ?? amount).toFixed(2)} credit to ${selectedClient.fullName}` +
            (typeof result.data?.new_credit_balance === "number" ? `. New credit balance: ${result.data.new_credit_balance.toFixed(2)}` : "")
        )
        onSubmit?.({ idNumber: selectedId, amount: Number(amount) })
        onSuccess?.()
        setOpen(false)
        resetForm()
      } else {
        const errorMessage = result.error || "Failed to add credit payment"
        if (errorMessage.includes("401") || errorMessage.includes("authentication")) {
          toast.error("Authentication failed. Please log in again.")
        } else if (errorMessage.includes("404") || errorMessage.includes("not found")) {
          toast.error("Customer not found. Please verify the customer exists.")
        } else if (errorMessage.includes("400") || errorMessage.includes("invalid")) {
          toast.error("Invalid request. Please check the credit amount and try again.")
        } else if (errorMessage.includes("500") || errorMessage.includes("server")) {
          toast.error("Server error. Failed to update customer credit or record payment.")
        } else {
          toast.error(errorMessage)
        }
      }
    } catch (error) {
      console.error("Credit payment error:", error)
      toast.error("An unexpected error occurred while processing the payment")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Credit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className={cn(className)}>
        <DialogHeader>
          <DialogTitle>Add Credit</DialogTitle>
          <DialogDescription>
            Search a client by ID Number or Name and enter the credit amount to add.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wide text-muted-foreground mb-1">Search Client</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by ID Number or Name"
                className="pl-8"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>

          {query.trim() && (
            <div className="max-h-48 overflow-auto border rounded-md divide-y">
              {searching ? (
                <div className="p-4 text-sm text-muted-foreground flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Searching clients...
                </div>
              ) : searchError ? (
                <div className="p-4 text-sm text-red-600">
                  {searchError}
                </div>
              ) : searchResults.length ? (
                searchResults.slice(0, 50).map((c) => (
                  <button
                    key={c.idNumber}
                    type="button"
                    onClick={() => setSelectedId(c.idNumber)}
                    className={cn(
                      "w-full text-left p-3 hover:bg-accent/50 flex items-center justify-between gap-3",
                      selectedId === c.idNumber && "bg-accent"
                    )}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-blue-600 dark:text-blue-500" />
                        <span className="font-medium text-foreground truncate">{c.fullName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground text-xs mt-1">
                        <IdCard className="h-3.5 w-3.5" />
                        <span className="truncate">{c.idNumber}</span>
                      </div>
                    </div>
                    {selectedId === c.idNumber && <Check className="h-4 w-4 text-primary shrink-0" />}
                  </button>
                ))
              ) : query.trim().length >= 2 ? (
                <div className="p-4 text-sm text-muted-foreground">No clients match your search.</div>
              ) : (
                <div className="p-4 text-sm text-muted-foreground">Type at least 2 characters to search.</div>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs uppercase tracking-wide text-muted-foreground mb-1">Credit Amount</label>
            <div className="relative">
              <Banknote className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="number"
                min={0}
                step={0.01}
                placeholder="0.00"
                className="pl-8"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                aria-invalid={!validAmount && amount !== ""}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wide text-muted-foreground mb-1">Payment Type</label>
            <Select value={paymentType} onValueChange={(value: "EFT" | "Cash" | "Card") => setPaymentType(value)}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EFT">EFT</SelectItem>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="Card">Card</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedClient && (
            <div className="text-sm text-muted-foreground">
              Adding credit to: <span className="font-medium text-foreground">{selectedClient.fullName}</span> ({selectedClient.idNumber})
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>Cancel</Button>
          <Button
            onClick={handleConfirm}
            disabled={
              !selectedId ||
              !validAmount ||
              !selectedClient?.id ||
              submitting
            }
          >
            {submitting ? "Processing..." : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
