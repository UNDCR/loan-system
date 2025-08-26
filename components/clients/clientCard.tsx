import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, IdCard, User, FolderOpen, Banknote, MapPin } from "lucide-react"
import { ClientData } from "@/lib/types"
import { ClientEditDialog } from "@/components/clients/clientEditForm"

interface ClientCardProps {
  client: ClientData
  onClientUpdated?: () => Promise<void>
}

export function ClientCard({ client, onClientUpdated }: ClientCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false)
  return (
    <Card className="bg-white dark:bg-stone-900/70">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 min-w-0">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600 dark:text-blue-500" />
              <h3 className="text-lg font-semibold text-foreground truncate">{client.fullName}</h3>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div>
                <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wide">
                  <Mail className="h-4 w-4" /> Email
                </div>
                <p className="text-sm font-medium text-foreground mt-1 truncate">{client.email}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wide">
                  <Phone className="h-4 w-4" /> Phone
                </div>
                <p className="text-sm font-medium text-foreground mt-1">{client.phoneNumber}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wide">
                  <IdCard className="h-4 w-4" /> ID Number
                </div>
                <p className="text-sm font-medium text-foreground mt-1">{client.idNumber}</p>
              </div>
              
              {client.address && (
                <div>
                  <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wide">
                    <MapPin className="h-4 w-4" /> Address
                  </div>
                  <div className="mt-1 text-sm text-foreground space-y-1">
                    {client.address.streetName && <p className="font-medium">{client.address.streetName}</p>}
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      {client.address.town && <span>{client.address.town}</span>}
                      {client.address.province && <span>{client.address.province}</span>}
                      {client.address.postalCode && <span>{client.address.postalCode}</span>}
                      {client.address.country && <span>{client.address.country}</span>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="text-right shrink-0 space-y-3">
            <div>
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Loans</div>
              <div className="flex items-center justify-end gap-2 mt-1">
                <FolderOpen className="h-4 w-4 text-primary" />
                <Badge className="px-2 py-0.5 text-xs">{client.loansCount}</Badge>
              </div>
            </div>

            <div>
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Credit</div>
              <div className="flex items-center justify-end gap-2 mt-1">
                <Banknote className="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
                <Badge variant="secondary" className="px-2 py-0.5 text-xs">
                  {new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(client.creditAmount ?? 0)}
                </Badge>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <ClientEditDialog
            client={client}
            open={isEditOpen}
            onOpenChange={setIsEditOpen}
            onSave={async () => {
              setIsEditOpen(false)
              if (onClientUpdated) {
                await onClientUpdated()
              }
            }}
            trigger={
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setIsEditOpen(true)}
              >
                Edit
              </Button>
            }
          />
        </div>
        <div className="mt-4 flex justify-between items-start">
          <div />
          <div className="text-right space-y-1">
            <div className="flex items-center justify-end">
            </div>
            {client.bookedOut && client.bookedOutDate && (
              <div className="text-[11px] text-muted-foreground">
                {new Date(client.bookedOutDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
