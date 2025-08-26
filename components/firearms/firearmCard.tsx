"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Calendar, Hash, Package, Trash2, Edit } from "lucide-react"
import { toast } from "sonner"
import { deleteFirearm } from "@/actions/firearms"
import { EditFirearmDialog } from "./editFirearmDialog"

export default function FirearmCard({
  id,
  makeModel,
  stockNumber,
  serialNumber,
  dateAdded,
  isBookedOut,
  bookedOutDate,
  onDeleted,
  onUpdated,
}: FirearmCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const handleDelete = async () => {
    if (!id) return

    try {
      setIsDeleting(true)
      const result = await deleteFirearm(id)

      if (!result.success) {
        throw new Error(result.error || "Failed to delete firearm")
      }

      toast.success("Firearm deleted successfully")
      onDeleted?.(id)
      setShowDeleteDialog(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete firearm")
    } finally {
      setIsDeleting(false)
    }
  }



  return (
    <Card className="bg-white dark:bg-stone-800">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-foreground leading-tight">{makeModel}</CardTitle>
            {isBookedOut && bookedOutDate && (
              <p className="text-xs text-muted-foreground mt-1">
                Booked out on: {formatDate(bookedOutDate)}
              </p>
            )}
          </div>
          <Badge variant={!isBookedOut ? 'default' : 'destructive'} className="ml-2 shrink-0">
            <Package className="w-3 h-3 mr-1" />
            {!isBookedOut ? 'In Storage' : 'Booked Out'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center space-x-3">
            <Hash className="w-4 h-4 text-muted-foreground shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-muted-foreground">Stock Number</p>
              <p className="text-sm font-mono text-foreground truncate">{stockNumber}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Hash className="w-4 h-4 text-muted-foreground shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-muted-foreground">Serial Number</p>
              <p className="text-sm font-mono text-foreground truncate">{serialNumber}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-muted-foreground">Date Added</p>
              <p className="text-sm text-foreground">{formatDate(dateAdded)}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowEditDialog(true)}
            className="gap-2"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            className="gap-2"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md" showCloseButton={!isDeleting}>
          <DialogHeader>
            <DialogTitle>Delete Firearm</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this firearm? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-muted p-3 rounded-md">
              <p className="text-sm font-medium">{makeModel}</p>
              <p className="text-xs text-muted-foreground">Stock: {stockNumber}</p>
              <p className="text-xs text-muted-foreground">Serial: {serialNumber}</p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <EditFirearmDialog
        firearm={{
          id,
          makeModel,
          stockNumber,
          serialNumber,
        }}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onUpdated={onUpdated}
      />

    </Card>
  )
}


interface FirearmCardProps {
  id: string
  makeModel: string
  stockNumber: string
  serialNumber: string
  dateAdded: string
  isBookedOut: boolean
  bookedOutDate?: string | null
  onDeleted?: (id: string) => void
  onUpdated?: (id: string) => void
}