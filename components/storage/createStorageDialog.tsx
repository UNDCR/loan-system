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

import { searchFirearms } from "@/actions/firearms"
import type { EnhancedFirearmData, Customer } from "@/lib/types"
import { useDebounceSearch } from "@/utils/useDebounceSearch"

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

  const [selectedFirearm, setSelectedFirearm] = useState<EnhancedFirearmData | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  const firearmSearch = useDebounceSearch<EnhancedFirearmData>({
    searchFunction: async (query: string) => {
      const res = await searchFirearms(query)
      return res
    },
    debounceDelay: 600,
    onError: (error) => toast.error(error)
  })

  const customerSearch = useDebounceSearch<Customer>({
    searchFunction: async (query: string) => {
      const { searchClientsByName, searchClientsByIdNumber } = await import("@/actions/search")
      const isIdNumber = /^\d+$/.test(query.trim())
      const res = isIdNumber
        ? await searchClientsByIdNumber(query.trim())
        : await searchClientsByName(query.trim())

      if (res.success && res.data) {
        const customers: Customer[] = res.data.map(client => ({
          id: client.id || client.idNumber,
          full_name: client.fullName,
          email: client.email,
          phone_number: client.phoneNumber,
          id_number: client.idNumber,
          created_at: "",
          firearm_id: null,
          customer_address_id: null,
          address: null
        }))
        return { success: true, data: customers, error: undefined }
      }
      return { success: false, data: undefined, error: res.error || "Search failed" }
    },
    debounceDelay: 600,
    onError: (error) => toast.error(error)
  })



  const handleFirearmSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = toUpperCase(e.target.value)
    firearmSearch.setQuery(q)
    setSelectedFirearm(null)
  }

  const selectCustomer = (customer: Customer) => {
    customerSearch.stopSearch()
    setSelectedCustomer(customer)
    customerSearch.clearResults()
  }

  const clearCustomerSelection = () => {
    customerSearch.stopSearch()
    setSelectedCustomer(null)
    customerSearch.clearResults()
  }

  const pickFirearm = (f: EnhancedFirearmData) => {
    firearmSearch.stopSearch()
    setSelectedFirearm(f)
    firearmSearch.clearResults()
  }

  const clearFirearmSelection = () => {
    firearmSearch.stopSearch()
    setSelectedFirearm(null)
    firearmSearch.clearResults()
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
      firearmSearch.stopSearch()
      firearmSearch.clearResults()
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
                    value={firearmSearch.query}
                    onChange={handleFirearmSearch}
                    placeholder="Search serial, stock, or make/model"
                    aria-label="Search firearm"
                    disabled={!!selectedFirearm}
                    className={selectedFirearm ? "opacity-60 cursor-not-allowed" : ""}
                    required
                  />
                  {firearmSearch.isSearching && !selectedFirearm && (
                    <div className="absolute right-2 top-2.5 text-muted-foreground">
                      <span className="animate-pulse">…</span>
                    </div>
                  )}
                  {!!firearmSearch.results.length && !selectedFirearm && (
                    <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover shadow">
                      <ul className="max-h-60 overflow-auto text-sm">
                        {firearmSearch.results.map((f) => (
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
                  <div className="mt-2 rounded-md border bg-card p-3 shadow-sm relative">
                    <button
                      type="button"
                      onClick={clearFirearmSelection}
                      className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
                      aria-label="Clear firearm selection"
                    >
                      ×
                    </button>
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
                    value={customerSearch.query}
                    onChange={(e) => {
                      const q = toUpperCase(e.target.value)
                      customerSearch.setQuery(q)
                      setSelectedCustomer(null)
                    }}
                    placeholder="Search name or ID number"
                    aria-label="Search customer"
                    disabled={!!selectedCustomer}
                    className={selectedCustomer ? "opacity-60 cursor-not-allowed" : ""}
                    required
                  />
                  {customerSearch.isSearching && !selectedCustomer && (
                    <div className="absolute right-2 top-2.5 text-muted-foreground">
                      <span className="animate-pulse">…</span>
                    </div>
                  )}
                  {!!customerSearch.results.length && !selectedCustomer && (
                    <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover shadow">
                      <ul className="max-h-60 overflow-auto text-sm">
                        {customerSearch.results.map((c: Customer) => (
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
                  <div className="mt-2 rounded-md border bg-card p-3 shadow-sm relative">
                    <button
                      type="button"
                      onClick={clearCustomerSelection}
                      className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
                      aria-label="Clear customer selection"
                    >
                      ×
                    </button>
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
