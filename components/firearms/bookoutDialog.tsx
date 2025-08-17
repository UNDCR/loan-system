"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"

export function BookoutDialog({
  trigger,
  onConfirm,
}: {
  trigger: React.ReactNode
  onConfirm?: (invoiceNumber: string) => void
}) {
  const [invoiceNumber, setInvoiceNumber] = useState("")
  const [confirmed, setConfirmed] = useState(false)

  const canSubmit = confirmed && invoiceNumber.trim().length > 0

  const handleConfirm = () => {
    if (!canSubmit) return
    onConfirm?.(invoiceNumber.trim())
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Book out firearm</DialogTitle>
          <DialogDescription>
            Confirm you want to book out this firearm and provide the invoice number.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="invoiceNumber">Invoice Number</Label>
            <Input
              id="invoiceNumber"
              placeholder="Enter invoice number"
              value={invoiceNumber}
              inputMode="numeric"
              pattern="[0-9]*"
              onChange={(e) => {
                const onlyDigits = e.target.value.replace(/\D/g, "")
                setInvoiceNumber(onlyDigits)
              }}
            />
          </div>

          <div className="flex items-start gap-2">
            <Checkbox id="confirm" checked={confirmed} onCheckedChange={(v) => setConfirmed(!!v)} />
            <Label htmlFor="confirm" className="text-sm leading-6">
              I confirm I want to book out this firearm.
            </Label>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button type="button" onClick={handleConfirm} disabled={!canSubmit} className="font-semibold">
              Book Out
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
