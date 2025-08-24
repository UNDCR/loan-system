"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, IdCard, User, Shield, Calendar, Loader2 } from "lucide-react"
import { useEffect, useActionState } from "react"
import { toast } from "sonner"
import { blockStaffFormAction, unblockStaffFormAction, type ActionState } from "@/actions/admin"
import { useRouter } from "next/navigation"
import { useFormStatus } from "react-dom"
import { useAuth } from "@/components/providers/authProvider"

export type Staff = {
  id: string
  full_name: string
  email: string
  phone: string
  role: string
  id_number: string
  blocked?: boolean
  created_at?: string
}

export interface StaffCardProps {
  staff: Staff
  onEdit?: (staff: Staff) => void
}

export function StaffCard({ staff, onEdit }: StaffCardProps) {
  const router = useRouter()
  const [blockState, blockAction] = useActionState<ActionState, FormData>(blockStaffFormAction, {})
  const [unblockState, unblockAction] = useActionState<ActionState, FormData>(unblockStaffFormAction, {})
  const { user } = useAuth()
  const isSelf = user?.id === staff.id

  useEffect(() => {
    if (blockState.success) {
      toast.success("User blocked")
      router.refresh()
    } else if (blockState.error) {
      toast.error(blockState.error)
    }
  }, [blockState, router])

  useEffect(() => {
    if (unblockState.success) {
      toast.success("User unblocked")
      router.refresh()
    } else if (unblockState.error) {
      toast.error(unblockState.error)
    }
  }, [unblockState, router])

  function SubmitButton({ variant, idleLabel, pendingLabel, disabled }: { variant: "secondary" | "destructive" | "outline"; idleLabel: string; pendingLabel: string; disabled?: boolean }) {
    const { pending } = useFormStatus()
    return (
      <Button size="sm" variant={variant} type="submit" disabled={pending || disabled}>
        {pending ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            {pendingLabel}
          </span>
        ) : (
          idleLabel
        )}
      </Button>
    )
  }
  return (
    <Card className="bg-white dark:bg-stone-900/70">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 min-w-0">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600 dark:text-blue-500" />
              <h3 className="text-lg font-semibold text-foreground truncate">{staff.full_name}</h3>
              {staff.blocked && (
                <Badge variant="destructive" className="ml-2">
                  Blocked
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div>
                <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wide">
                  <Shield className="h-4 w-4" /> Role
                </div>
                <p className="text-sm font-medium text-foreground mt-1">{staff.role}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wide">
                  <Mail className="h-4 w-4" /> Email
                </div>
                <p className="text-sm font-medium text-foreground mt-1 truncate">{staff.email}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wide">
                  <Phone className="h-4 w-4" /> Phone
                </div>
                <p className="text-sm font-medium text-foreground mt-1">{staff.phone}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wide">
                  <IdCard className="h-4 w-4" /> ID Number
                </div>
                <p className="text-sm font-medium text-foreground mt-1">{staff.id_number}</p>
              </div>
              {staff.created_at && (
                <div>
                  <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wide">
                    <Calendar className="h-4 w-4" /> Created
                  </div>
                  <p className="text-sm font-medium text-foreground mt-1">{new Date(staff.created_at).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex justify-end gap-2">
          <Button size="sm" variant="outline" onClick={() => onEdit?.(staff)}>
            Edit
          </Button>
          {staff.blocked ? (
            <form action={unblockAction}>
              <input type="hidden" name="id" value={staff.id} />
              <SubmitButton variant="secondary" idleLabel="Unblock" pendingLabel="Unblocking" disabled={isSelf} />
            </form>
          ) : (
            <form action={blockAction}>
              <input type="hidden" name="id" value={staff.id} />
              <SubmitButton variant="destructive" idleLabel="Block" pendingLabel="Blocking" disabled={isSelf} />
            </form>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

