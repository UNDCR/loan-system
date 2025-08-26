"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { toUpperCase } from "@/utils/textUtils"
import { createBasicFirearm, searchFirearms, bookInFirearm } from "@/actions/firearms"

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
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [isBookingIn, setIsBookingIn] = useState(false)

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
      if (!res.success) {
        if (res.error === "Firearm with this serial number already exists") {
          setShowConfirmModal(true)
          return
        }
        throw new Error(res.error || "Failed to create firearm")
      }
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

  const handleBookInAgain = async () => {
    setIsBookingIn(true)
    try {
      const searchResult = await searchFirearms(formData.serial_number.trim())
      if (!searchResult.success || !searchResult.data.length) {
        throw new Error("Could not find firearm to book in")
      }

      const firearm = searchResult.data.find(f => f.serialNumber === formData.serial_number.trim())
      if (!firearm) {
        throw new Error("Could not find firearm with matching serial number")
      }

      const bookInResult = await bookInFirearm(firearm.id)
      if (!bookInResult.success) {
        throw new Error(bookInResult.error || "Failed to book in firearm")
      }

      toast.success("Firearm booked in successfully")
      setShowConfirmModal(false)
      setOpen?.(false)
      setFormData({ make_model: "", stock_number: "", serial_number: "" })
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to book in firearm")
    } finally {
      setIsBookingIn(false)
    }
  }

  const handleCancelBookIn = () => {
    setShowConfirmModal(false)
  }

  return (
    <>
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

      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Firearm Already Exists</DialogTitle>
            <DialogDescription>
              This firearm already exists in the system. Would you like to book it in again?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button type="button" variant="outline" onClick={handleCancelBookIn} disabled={isBookingIn}>
              Cancel
            </Button>
            <Button type="button" onClick={handleBookInAgain} disabled={isBookingIn}>
              {isBookingIn ? "Booking in..." : "Yes, book in again"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
