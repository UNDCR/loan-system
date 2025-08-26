"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { updateFirearm } from "@/actions/firearms"
import { toUpperCase } from "@/utils/textUtils"

interface EditFirearmDialogProps {
  firearm: {
    id: string
    makeModel: string
    stockNumber: string
    serialNumber: string
  }
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdated?: (id: string) => void
}

interface FormData {
  makeModel: string
  stockNumber: string
  serialNumber: string
}

export function EditFirearmDialog({ firearm, open, onOpenChange, onUpdated }: EditFirearmDialogProps) {
  const [form, setForm] = useState<FormData>({
    makeModel: firearm.makeModel,
    stockNumber: firearm.stockNumber,
    serialNumber: firearm.serialNumber,
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setForm({
      makeModel: firearm.makeModel,
      stockNumber: firearm.stockNumber,
      serialNumber: firearm.serialNumber,
    })
  }, [firearm])

  const handleChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [field]: toUpperCase(e.target.value) }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    if (!form.makeModel.trim() || !form.stockNumber.trim() || !form.serialNumber.trim()) {
      toast.error("All fields are required")
      return
    }

    setIsLoading(true)
    
    try {
      const result = await updateFirearm(firearm.id, {
        make_model: form.makeModel.trim(),
        stock_number: form.stockNumber.trim(),
        serial_number: form.serialNumber.trim(),
      })

      if (!result.success) {
        throw new Error(result.error || "Failed to update firearm")
      }

      toast.success("Firearm updated successfully")
      onUpdated?.(firearm.id)
      onOpenChange(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update firearm")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton={!isLoading}>
        <DialogHeader>
          <DialogTitle>Edit Firearm</DialogTitle>
          <DialogDescription>
            Update the firearm details. All fields are required.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-makeModel">Make/Model</Label>
              <Input
                id="edit-makeModel"
                value={form.makeModel}
                onChange={handleChange('makeModel')}
                placeholder="Enter make and model"
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-stockNumber">Stock Number</Label>
              <Input
                id="edit-stockNumber"
                value={form.stockNumber}
                onChange={handleChange('stockNumber')}
                placeholder="Enter stock number"
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-serialNumber">Serial Number</Label>
              <Input
                id="edit-serialNumber"
                value={form.serialNumber}
                onChange={handleChange('serialNumber')}
                placeholder="Enter serial number"
                required
                disabled={isLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button"
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
