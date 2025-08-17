"use client"

import { useState } from "react"
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
import { inviteUser } from "@/actions/staff"
import { toast } from "sonner"

export function InviteStaffDialog({ trigger, onInvite, open, onOpenChange }: InviteStaffDialogProps) {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [role, setRole] = useState("")
  const [idNumber, setIdNumber] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const canSubmit = fullName.trim() && email.trim() && phone.trim() && role.trim() && idNumber.trim()

  const handleInvite = async () => {
    if (!canSubmit || submitting) return
    try {
      setSubmitting(true)
      const res = await inviteUser({
        email: email.trim(),
        profile: {
          full_name: fullName.trim(),
          phone_number: phone.trim(),
          role: role.trim(),
          id_number: idNumber.trim(),
        },
      })
      if (!res.success) throw new Error(res.error || "Invite failed")
      onInvite?.({
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        role: role.trim(),
        id_number: idNumber.trim(),
      })
      toast.success("Invite sent")
      setFullName("")
      setEmail("")
      setPhone("")
      setRole("")
      setIdNumber("")
      onOpenChange?.(false)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Invite failed")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite staff</DialogTitle>
          <DialogDescription>Add a new staff member by providing their details.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jane Doe" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane.doe@example.com"
            />
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
            <Button type="button" variant="outline" disabled={submitting}>
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleInvite} disabled={!canSubmit || submitting} className="font-semibold">
            {submitting ? "Inviting..." : "Invite"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export interface InviteStaffDialogProps {
  trigger?: React.ReactNode
  onInvite?: (staff: Omit<Staff, "id" | "blocked">) => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
}