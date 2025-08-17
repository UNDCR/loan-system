"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Staff } from "./staffCard"
import { updateStaff } from "@/actions/staff"

export function EditStaffDialog({ trigger, staff, open, onOpenChange, onSave }: EditStaffDialogProps) {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [role, setRole] = useState("")
  const [idNumber, setIdNumber] = useState("")

  useEffect(() => {
    setFullName(staff?.full_name ?? "")
    setEmail(staff?.email ?? "")
    setPhone(staff?.phone ?? "")
    setRole(staff?.role ?? "")
    setIdNumber(staff?.id_number ?? "")
  }, [staff])

  const canSubmit = fullName.trim() && phone.trim() && role.trim() && idNumber.trim()

  const handleSave = async () => {
    if (!canSubmit || !staff) return
    const payload = {
      full_name: fullName.trim(),
      phone_number: phone.trim(),
      role: role.trim(),
      id_number: idNumber.trim(),
      email: staff.email, // preserve original email, not editable
    }
    const res = await updateStaff(staff.id, payload)
    if (res.success) {
      onSave?.({ ...staff, full_name: payload.full_name, email, phone, role: payload.role, id_number: payload.id_number })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit staff</DialogTitle>
          <DialogDescription>Update the staff member&apos;s details.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jane Doe" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} placeholder="jane.doe@example.com" disabled readOnly />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Staff">Staff</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              placeholder="0712345678"
              inputMode="numeric"
              pattern="[0-9]*"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="idNumber">ID number</Label>
            <Input id="idNumber" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} placeholder="1234567890123" />
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button type="button" onClick={handleSave} disabled={!canSubmit} className="font-semibold">
              Save changes
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export interface EditStaffDialogProps {
  trigger?: React.ReactNode
  staff?: Staff | null
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSave?: (staff: Staff) => void
}