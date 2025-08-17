"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { toUpperCase } from "@/utils/textUtils"
import { createStorageEntry, type CreateStoragePayload } from "@/actions/storage"
import type { StorageEntry } from "@/lib/types"
import { useClientSearch } from "@/hooks/useClientSearch"
import { searchFirearms } from "@/actions/firearms"
import type { EnhancedFirearmData, Customer } from "@/lib/types"

export function CreateStorageDialog({ open, onOpenChange, trigger, onCreated }: { open?: boolean; onOpenChange?: (v: boolean) => void; trigger?: React.ReactNode; onCreated?: (entry: StorageEntry) => void }) {
  const [internalOpen, setInternalOpen] = useState(false)
  const controlled = typeof open === "boolean" && typeof onOpenChange === "function"
  const isOpen = controlled ? open : internalOpen
  const setOpen = controlled ? onOpenChange : setInternalOpen

  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<Pick<CreateStoragePayload, "storage_type" | "bookin_date" | "bookout_date">>({
    storage_type: "",
    bookin_date: "",
    bookout_date: "",
  })

  const [firearmQuery, setFirearmQuery] = useState("")
  const [firearmResults, setFirearmResults] = useState<EnhancedFirearmData[]>([])
  const [isFirearmSearching, setIsFirearmSearching] = useState(false)
  const [selectedFirearm, setSelectedFirearm] = useState<EnhancedFirearmData | null>(null)

  const {
    searchInput: customerQuery,
    setSearchInput: setCustomerQuery,
    searchResults: customerResults,
    isSearching: isCustomerSearching,
    selectedCustomer,
    selectCustomer,
    clearSelection: clearCustomerSelection,
  } = useClientSearch()

  const handleFirearmSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = toUpperCase(e.target.value)
    setFirearmQuery(q)
    setSelectedFirearm(null)
    if (!q.trim()) {
      setFirearmResults([])
      return
    }
    try {
      setIsFirearmSearching(true)
      const res = await searchFirearms(q.trim())
      if (res.success) setFirearmResults(res.data)
      else {
        setFirearmResults([])
        if (res.error) toast.error(res.error)
      }
    } catch {
      setFirearmResults([])
      toast.error("Failed to search firearms")
    } finally {
      setIsFirearmSearching(false)
    }
  }

  const pickFirearm = (f: EnhancedFirearmData) => {
    setSelectedFirearm(f)
    setFirearmQuery(`${f.makeModel} • ${f.stockNumber || "-"} • ${f.serialNumber || "-"}`)
    setFirearmResults([])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      if (!selectedFirearm?.id) {
        throw new Error("Select a firearm")
      }
      if (!selectedCustomer?.id) {
        throw new Error("Select a customer")
      }
      const payload: CreateStoragePayload = {
        firearm_id: selectedFirearm.id,
        customer_id: selectedCustomer.id,
        storage_type: formData.storage_type.trim(),
        bookin_date: formData.bookin_date,
        bookout_date: formData.bookout_date,
      }
      const res = await createStorageEntry(payload)
      if (!res.success) throw new Error(res.error || "Failed to create storage entry")
      onCreated?.(res.data)
      setOpen(false)
      setFormData({ storage_type: "", bookin_date: "", bookout_date: "" })
      setSelectedFirearm(null)
      setFirearmQuery("")
      clearCustomerSelection()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create storage entry")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent className="sm:max-w-2xl md:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Add Storage</DialogTitle>
          <DialogDescription>Create a new firearm storage entry.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firearm_search">Firearm</Label>
                <div className="relative">
                  <Input
                    id="firearm_search"
                    value={firearmQuery}
                    onChange={handleFirearmSearch}
                    placeholder="Search serial, stock, or make/model"
                    aria-label="Search firearm"
                    required
                  />
                  {isFirearmSearching && (
                    <div className="absolute right-2 top-2.5 text-muted-foreground">
                      <span className="animate-pulse">…</span>
                    </div>
                  )}
                  {!!firearmResults.length && (
                    <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover shadow">
                      <ul className="max-h-60 overflow-auto text-sm">
                        {firearmResults.map((f) => (
                          <li key={f.id}>
                            <button
                              type="button"
                              className="w-full text-left px-3 py-2 hover:bg-muted"
                              onClick={() => pickFirearm(f)}
                            >
                              <div className="font-medium">{f.makeModel || "Unknown"}</div>
                              <div className="text-xs text-muted-foreground">{f.stockNumber || "-"} • {f.serialNumber || "-"}</div>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                {selectedFirearm && (
                  <div className="mt-2 rounded-md border bg-card p-3 shadow-sm">
                    <div className="text-sm font-medium">{selectedFirearm.makeModel || "Unknown"}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      <span className="font-medium">Stock:</span> {selectedFirearm.stockNumber || "-"}
                      <span className="mx-2">•</span>
                      <span className="font-medium">Serial:</span> {selectedFirearm.serialNumber || "-"}
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer_search">Customer</Label>
                <div className="relative">
                  <Input
                    id="customer_search"
                    value={customerQuery}
                    onChange={(e) => setCustomerQuery(toUpperCase(e.target.value))}
                    placeholder="Search name or ID number"
                    aria-label="Search customer"
                    required
                  />
                  {isCustomerSearching && (
                    <div className="absolute right-2 top-2.5 text-muted-foreground">
                      <span className="animate-pulse">…</span>
                    </div>
                  )}
                  {!!customerResults.length && (
                    <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover shadow">
                      <ul className="max-h-60 overflow-auto text-sm">
                        {customerResults.map((c: Customer) => (
                          <li key={c.id}>
                            <button
                              type="button"
                              className="w-full text-left px-3 py-2 hover:bg-muted"
                              onClick={() => selectCustomer(c)}
                            >
                              <div className="font-medium">{c.full_name || "Unknown"}</div>
                              <div className="text-xs text-muted-foreground">{c.id_number || "-"} • {c.phone_number || "-"}</div>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                {selectedCustomer && (
                  <div className="mt-2 rounded-md border bg-card p-3 shadow-sm">
                    <div className="text-sm font-medium">{selectedCustomer.full_name || "Unknown"}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      <span className="font-medium">ID:</span> {selectedCustomer.id_number || "-"}
                      <span className="mx-2">•</span>
                      <span className="font-medium">Phone:</span> {selectedCustomer.phone_number || "-"}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-1">
                <Label htmlFor="storage_type">Storage Type</Label>
                <Input id="storage_type" value={formData.storage_type} onChange={(e) => setFormData(prev => ({ ...prev, storage_type: toUpperCase(e.target.value) })) } placeholder="vault" required />
              </div>
              <div className="space-y-2 md:col-span-1">
                <Label htmlFor="bookin_date">Booked In</Label>
                <Input id="bookin_date" type="date" value={formData.bookin_date} onChange={(e) => setFormData(prev => ({ ...prev, bookin_date: e.target.value })) } required />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>{isLoading ? "Saving..." : "Save"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
