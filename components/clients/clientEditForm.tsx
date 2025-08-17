"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ClientData } from "@/lib/types"
import { toUpperCase } from "@/utils/textUtils"
import { submitClientForm } from "@/actions/clients"

interface ClientEditDialogProps {
  client: ClientData
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSave?: (client: ClientData) => void
  trigger?: React.ReactNode
}

interface FormData {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  idNumber: string;
  streetName: string;
  town: string;
  province: string;
  postalCode: string;
  country: string;
}

export function ClientEditDialog({ client, open, onOpenChange, onSave, trigger }: ClientEditDialogProps) {
  const router = useRouter()
  const [form, setForm] = useState<FormData>({
    id: client.id || '',
    fullName: client.fullName || '',
    email: client.email || '',
    phoneNumber: client.phoneNumber || '',
    idNumber: client.idNumber || '',
    streetName: client.address?.streetName || '',
    town: client.address?.town || '',
    province: client.address?.province || '',
    postalCode: client.address?.postalCode || '',
    country: client.address?.country || ''
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setForm({
      id: client.id || '',
      fullName: client.fullName || '',
      email: client.email || '',
      phoneNumber: client.phoneNumber || '',
      idNumber: client.idNumber || '',
      streetName: client.address?.streetName || '',
      town: client.address?.town || '',
      province: client.address?.province || '',
      postalCode: client.address?.postalCode || '',
      country: client.address?.country || ''
    })
  }, [client])

  const handleChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const clientData = {
        id: form.id,
        full_name: form.fullName || undefined,
        id_number: form.idNumber ? form.idNumber : null,
        phone_number: form.phoneNumber ? form.phoneNumber : null,
        email: form.email ? form.email : null,
        address: {
          id: client.address?.id ?? null,
          street_name: form.streetName,
          town: form.town,
          province: form.province ? form.province : null,
          postal_code: form.postalCode ? form.postalCode : null,
          country: form.country ? form.country : null,
        },
      }
      
      const result = await submitClientForm(clientData)

      if (!result?.success) {
        throw new Error(result?.error || 'Failed to update client')
      }

      toast.success("Client updated successfully")

      onSave?.(client)
      onOpenChange?.(false)
      router.refresh()
    } catch (error) {
      console.error('Error in handleSubmit:', {
        error,
        errorString: String(error),
        errorStack: error instanceof Error ? error.stack : 'No stack trace',
        formData: form
      })
      toast.error(error instanceof Error ? error.message : 'Failed to update client')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">Edit Client</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Client</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={form.fullName}
                onChange={(e) => setForm(prev => ({ ...prev, fullName: toUpperCase(e.target.value) }))}
                required
                className="w-full"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="idNumber">ID Number</Label>
                <Input
                  id="idNumber"
                  value={form.idNumber}
                  onChange={(e) => setForm(prev => ({ ...prev, idNumber: toUpperCase(e.target.value) }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={form.phoneNumber}
                  onChange={handleChange('phoneNumber')}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange('email')}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="streetName">Street</Label>
                <Input
                  id="streetName"
                  value={form.streetName}
                  onChange={(e) => setForm(prev => ({ ...prev, streetName: toUpperCase(e.target.value) }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="town">Town</Label>
                <Input
                  id="town"
                  value={form.town}
                  onChange={(e) => setForm(prev => ({ ...prev, town: toUpperCase(e.target.value) }))}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="province">Province</Label>
                <Input
                  id="province"
                  value={form.province}
                  onChange={(e) => setForm(prev => ({ ...prev, province: toUpperCase(e.target.value) }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  id="postalCode"
                  value={form.postalCode}
                  onChange={(e) => setForm(prev => ({ ...prev, postalCode: toUpperCase(e.target.value) }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={form.country}
                  onChange={(e) => setForm(prev => ({ ...prev, country: toUpperCase(e.target.value) }))}
                  required
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
