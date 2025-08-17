"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Hash, Package } from "lucide-react"

interface FirearmCardProps {
  makeModel: string
  stockNumber: string
  serialNumber: string
  dateAdded: string
  isBookedOut: boolean
  bookedOutDate?: string | null
}

export default function FirearmCard({
  makeModel,
  stockNumber,
  serialNumber,
  dateAdded,
  isBookedOut,
  bookedOutDate,
}: FirearmCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
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
          <Badge variant={!isBookedOut ? 'secondary' : 'destructive'} className="ml-2 shrink-0">
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
      </CardContent>
      
    </Card>
  )
}
