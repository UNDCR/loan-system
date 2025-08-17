"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { toUpperCase } from "@/utils/textUtils"
import { createBasicFirearm } from "@/actions/firearms"

export function CreateFirearmDialog({ open, onOpenChange, trigger, onCreated }: { open?: boolean; onOpenChange?: (v: boolean) => void; trigger?: React.ReactNode; onCreated?: (id: string) => void }) {
  const router = useRouter()
  const [internalOpen, setInternalOpen] = useState(false)
  const controlled = typeof open === "boolean" && typeof onOpenChange === "function"
  const isOpen = controlled ? open : internalOpen
  const setOpen = controlled ? onOpenChange : setInternalOpen

  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<{ make_model: string; stock_number: string; serial_number: string }>({
    make_model: "",
    stock_number: "",
    serial_number: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const payload = {
        make_model: formData.make_model.trim(),
        stock_number: formData.stock_number.trim(),
        serial_number: formData.serial_number.trim(),
      }
      if (!payload.make_model || !payload.stock_number || !payload.serial_number) throw new Error("All fields are required")
      const res = await createBasicFirearm(payload)
      if (!res.success) throw new Error(res.error || "Failed to create firearm")
      toast.success("Firearm added")
      onCreated?.(res.data.id)
      setOpen?.(false)
      setFormData({ make_model: "", stock_number: "", serial_number: "" })
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create firearm")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Firearm</DialogTitle>
          <DialogDescription>Create a new firearm.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2 md:col-span-3">
                <Label htmlFor="make_model">Make & Model</Label>
                <Input id="make_model" value={formData.make_model} onChange={(e) => setFormData(prev => ({ ...prev, make_model: toUpperCase(e.target.value) }))} placeholder="GLOCK 19" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock_number">Stock Number</Label>
                <Input id="stock_number" value={formData.stock_number} onChange={(e) => setFormData(prev => ({ ...prev, stock_number: toUpperCase(e.target.value) }))} placeholder="SN-009" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="serial_number">Serial Number</Label>
                <Input id="serial_number" value={formData.serial_number} onChange={(e) => setFormData(prev => ({ ...prev, serial_number: toUpperCase(e.target.value) }))} placeholder="ABC123" required />
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
