"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Package, XIcon, Save, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import { FirearmFormData } from "@/lib/types"
import { toast } from "sonner"
import { createFirearm } from "@/actions/firearms"
import { toUpperCase } from "@/utils/textUtils"
import { searchLoans } from "@/actions/search"
import type { LoanData } from "@/lib/types"

function FirearmFormContent({ onSave }: FirearmFormProps) {
  const router = useRouter()
  const [data, setData] = useState<FirearmFormData>({
    makeModel: "",
    stockNumber: "",
    serialNumber: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [searchInput, setSearchInput] = useState("")
  const [searchResults, setSearchResults] = useState<LoanData[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedLoan, setSelectedLoan] = useState<LoanData | null>(null)

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      if (!selectedLoan) throw new Error("Please select a loan")
      const result = await createFirearm({
        make_model: data.makeModel,
        stock_number: data.stockNumber,
        serial_number: data.serialNumber,
        booked_out: false,
        booked_out_date: null,
        customers_id: selectedLoan.customerId,
        loans_id: selectedLoan.loanId
      })
      if (!result.success) {
        throw new Error(result.error || "Failed to create firearm")
      }
      toast.success("Firearm created")
      onSave?.(data)
      router.refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create firearm"
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }, [data, onSave, selectedLoan, router])

  return (
    <Card className="border-foreground/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center gap-2 text-foreground">
          <Package className="h-5 w-5" />
          Firearm Details
        </CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm text-muted-foreground">Loan</label>
              <Input
                placeholder="Search by client name, quote, or invoice number"
                value={searchInput}
                onChange={async (e) => {
                  const v = toUpperCase(e.target.value)
                  setSearchInput(v)
                  setIsSearching(true)
                  const res = await searchLoans({ full_name: v, quote_number: v, invoice_number: v })
                  setSearchResults(res.data || [])
                  setIsSearching(false)
                }}
                className="bg-background text-foreground"
                disabled={isLoading}
              />
              {searchResults.length > 0 && (
                <div className="border rounded-md divide-y bg-background">
                  {searchResults.map((loan) => (
                    <button
                      type="button"
                      key={loan.quoteNumber}
                      className="w-full text-left px-3 py-2 hover:bg-accent"
                      onClick={() => { setSelectedLoan(loan); setSearchResults([]); setSearchInput(loan.fullName + ' - ' + loan.quoteNumber) }}
                      disabled={isLoading}
                    >
                      <div className="text-sm text-foreground">{loan.fullName}</div>
                      <div className="text-xs text-muted-foreground">Quote: {loan.quoteNumber}</div>
                    </button>
                  ))}
                </div>
              )}
              {selectedLoan && (
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Selected: {selectedLoan.fullName} ({selectedLoan.quoteNumber})</span>
                  <Button type="button" variant="ghost" size="sm" onClick={() => { setSelectedLoan(null); setSearchInput("") }} disabled={isLoading}>Clear</Button>
                </div>
              )}
              {isSearching && <div className="text-xs text-muted-foreground">Searching...</div>}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Make & Model</label>
              <Input
                placeholder="e.g., Glock 19 Gen5"
                value={data.makeModel}
                onChange={(e) => setData((d) => ({ ...d, makeModel: toUpperCase(e.target.value) }))}
                className="bg-background text-foreground"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Stock Number</label>
              <Input
                placeholder="e.g., STK-00123"
                value={data.stockNumber}
                onChange={(e) => setData((d) => ({ ...d, stockNumber: toUpperCase(e.target.value) }))}
                className="bg-background text-foreground"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Serial Number</label>
              <Input
                placeholder="e.g., ABC123456"
                value={data.serialNumber}
                onChange={(e) => setData((d) => ({ ...d, serialNumber: toUpperCase(e.target.value) }))}
                className="bg-background text-foreground"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="border-foreground/20 text-foreground" disabled={isLoading}>
                <XIcon className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export function FirearmFormDialog({
  open,
  onOpenChange,
  onSave,
  onCancel,
  trigger = (
    <Button>Firearm Details</Button>
  )
}: FirearmFormDialogProps) {
  const handleDialogOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen)
    if (!isOpen) {
      onCancel?.()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl p-0" showCloseButton={false}>
        <DialogTitle className="sr-only">Firearm Details</DialogTitle>
        <FirearmFormContent onSave={onSave} />
      </DialogContent>
    </Dialog>
  )
}

interface FirearmFormProps {
  onSave?: (data: FirearmFormData) => void
}

interface FirearmFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave?: (data: FirearmFormData) => void
  onCancel?: () => void
  trigger?: React.ReactNode
}