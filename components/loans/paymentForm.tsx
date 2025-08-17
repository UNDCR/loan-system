"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PaymentData, PaymentFormData } from "@/lib/types"
import type { LoanData } from "@/lib/types"
import { toast } from "sonner"
import { searchLoans } from "@/actions/search"
import { recordLoanPayment } from "@/actions/payments"
import { toUpperCase } from "@/utils/textUtils"

function PaymentFormContent({ onSave, onSubmit, onClose }: PaymentFormProps) {
  const router = useRouter()
  const [data, setData] = useState<PaymentFormData>({
    searchQuery: "",
    paymentType: "EFT",
    amount: "",
    paymentDate: "",
  })
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<LoanData[]>([])
  const [selectedLoan, setSelectedLoan] = useState<LoanData | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = useCallback(
    (field: keyof PaymentFormData, value: string) => {
      setData(prev => ({ ...prev, [field]: value }))
    },
    []
  )

  const handleSearch = useCallback(async (query: string) => {
    setSelectedLoan(null)
    setSearchResults([])
    if (!query.trim()) return
    try {
      setIsSearching(true)
      const result = await searchLoans({ full_name: query.trim() })
      if (!result.success) {
        if (result.error) toast.error(result.error)
        setSearchResults([])
      } else {
        setSearchResults(result.data ?? [])
      }
    } catch {
      toast.error("Failed to search loans")
    } finally {
      setIsSearching(false)
    }
  }, [])

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      if (!selectedLoan) {
        toast.error("Please select a loan")
        return
      }
      if (!data.paymentDate || !data.amount) {
        toast.error("Enter payment date and amount")
        return
      }
      const payload: PaymentData = {
        ...data,
        createdAt: new Date().toISOString(),
      }
      onSave?.(payload)
      // Build API input
      const apiInput = {
        loan_id: selectedLoan.loanId,
        payment_amount: Number(data.amount),
        payment_type: data.paymentType,
        payment_date: data.paymentDate,
      }
      setIsSubmitting(true)
      try {
        const res = await recordLoanPayment(apiInput)
        if (!res.success) {
          toast.error(res.error || "Failed to record payment")
          return
        }
        toast.success("Payment recorded")
        onSubmit?.(payload)
        router.refresh()
        onClose?.()
      } finally {
        setIsSubmitting(false)
      }
    },
    [data, onClose, onSave, onSubmit, router, selectedLoan]
  )

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">Record Payment</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="searchQuery">Search Client Name, ID or Quote Number</Label>
            <Input
              id="searchQuery"
              placeholder="e.g. Jane Doe, 8001015009087, LN-2024-001"
              value={data.searchQuery}
              onChange={(e) => {
                const q = toUpperCase(e.target.value)
                handleChange("searchQuery", q)
                if (q.trim().length >= 2) void handleSearch(q)
              }}
            />
            {isSearching && (
              <div className="text-sm text-muted-foreground">Searching…</div>
            )}
            {!!searchResults.length && (
              <div className="mt-2 grid gap-2">
                {searchResults.map((loan) => (
                  <Button
                    key={`${loan.loanId}-${loan.quoteNumber}`}
                    type="button"
                    variant={selectedLoan?.loanId === loan.loanId ? "default" : "outline"}
                    className="justify-start"
                    onClick={() => setSelectedLoan(loan)}
                    aria-pressed={selectedLoan?.loanId === loan.loanId}
                  >
                    {loan.fullName} · {loan.quoteNumber} · R{loan.remainingAmount}
                  </Button>
                ))}
              </div>
            )}
            {selectedLoan && (
              <div className="text-sm text-muted-foreground">Selected: {selectedLoan.fullName} · {selectedLoan.quoteNumber}</div>
            )}
          </div>

          {/* Payment Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="paymentType">Payment Type</Label>
              <Select
                value={data.paymentType}
                onValueChange={(value) => handleChange("paymentType", value)}
              >
                <SelectTrigger id="paymentType">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EFT">EFT</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Card">Card</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Payment Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={data.amount}
                onChange={(e) => handleChange("amount", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentDate">Payment Date</Label>
              <Input
                id="paymentDate"
                type="date"
                value={data.paymentDate}
                onChange={(e) => handleChange("paymentDate", e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? "Saving…" : "Save Payment"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export function PaymentFormDialog({
  open,
  onOpenChange,
  onSave,
  onSubmit,
  trigger = (<Button>Record Payment</Button>),
}: PaymentFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl p-0">
        <DialogTitle className="sr-only">Record Payment</DialogTitle>
        <PaymentFormContent onSave={onSave} onSubmit={onSubmit} onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}

interface PaymentFormProps {
  onSave?: (data: PaymentData) => void
  onSubmit?: (data: PaymentData) => void
  onClose?: () => void
}

interface PaymentFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave?: (data: PaymentData) => void
  onSubmit?: (data: PaymentData) => void
  trigger?: React.ReactNode
}