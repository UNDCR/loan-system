"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Calendar, Hash, Package, Trash2, User } from "lucide-react"
import type { StorageEntry } from "@/lib/types"
import { deleteStorageEntry } from "@/actions/storage"
import { toast } from "sonner"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

function fmt(date?: string | null) {
  if (!date) return "-"
  return new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
}

export function StorageCard({ entry, onDeleted }: { entry: StorageEntry; onDeleted?: (id: string) => void }) {
  const [deleting, setDeleting] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>("")
  const firearm = entry.firearm
  const customer = entry.customer

  const handleDelete = async () => {
    if (!entry.id) return
    if (!selectedDate) return
    try {
      setDeleting(true)
      const res = await deleteStorageEntry(entry.id, selectedDate)
      if (!res.success) throw new Error(res.error || "Failed to delete")
      toast.success("Storage deleted")
      onDeleted?.(entry.id)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete")
    } finally {
      setDeleting(false)
      setConfirmOpen(false)
    }
  }

  return (
    <Card className="bg-white dark:bg-stone-900/70">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-foreground">
              {firearm?.makeModel || "Unknown Firearm"}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">Booked in: {fmt(entry.bookedInDate)}</p>
            <p className="text-xs text-muted-foreground">Booked out: {fmt(entry.bookedOutDate)}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={firearm?.bookedOut ? "destructive" : "secondary"} className="ml-2 shrink-0">
              <Package className="w-3 h-3 mr-1" />
              {firearm?.bookedOut ? "Booked Out" : "In Storage"}
            </Badge>
            <Button variant="destructive" size="icon" onClick={() => setConfirmOpen(true)} disabled={deleting} aria-label="Delete storage">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center space-x-3">
            <Hash className="w-4 h-4 text-muted-foreground shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-muted-foreground">Stock Number</p>
              <p className="text-sm font-mono text-foreground truncate">{firearm?.stockNumber || "-"}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Hash className="w-4 h-4 text-muted-foreground shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-muted-foreground">Serial Number</p>
              <p className="text-sm font-mono text-foreground truncate">{firearm?.serialNumber || "-"}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-muted-foreground">Date Added</p>
              <p className="text-sm text-foreground">{fmt(firearm?.createdAt)}</p>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Storage Type</p>
            <p className="text-sm text-foreground">{entry.storageType || "-"}</p>
          </div>
          <div className="flex items-center text-sm font-semibold text-foreground">
            <User className="w-4 h-4 mr-2" /> Customer
          </div>
          <div className="pl-6 space-y-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Full Name</p>
              <p className="text-sm text-foreground">{customer?.name || "Unknown"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">ID Number</p>
              <p className="text-sm font-mono text-foreground">{customer?.idNumber || "-"}</p>
            </div>
          </div>
        </div>
      </CardContent>
      <Dialog open={confirmOpen} onOpenChange={(open) => { setConfirmOpen(open); if (!open) setSelectedDate("") }}>
        <DialogContent className="sm:max-w-md" showCloseButton={!deleting}>
          <DialogHeader>
            <DialogTitle>Book Firearm Out</DialogTitle>
            <DialogDescription>
              This will delete the storage record and Book the firearm out
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 py-2">
            <Label htmlFor="delete_date">Effective Date</Label>
            <Input
              id="delete_date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              required
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={deleting}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting || !selectedDate}>{deleting ? "Deleting..." : "Delete"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
