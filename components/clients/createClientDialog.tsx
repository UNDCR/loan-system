"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { createClient } from "@/actions/clients"
import { toUpperCase } from "@/utils/textUtils"

export interface CreateClientDialogProps {
  trigger?: React.ReactNode
  onClientCreated?: () => void
}

export function CreateClientDialog({ trigger, onClientCreated }: CreateClientDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    idNumber: "",
    fullName: "",
    phone: "",
    email: "",
    street: "",
    town: "",
    province: "",
    postalCode: "",
    country: ""
  })

  const handleChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    switch (field) {
      case 'fullName':
      case 'idNumber':
      case 'street':
      case 'town':
      case 'province':
      case 'postalCode':
      case 'country':
        setFormData(prev => ({ ...prev, [field]: toUpperCase(value) }))
        break
      default:
        setFormData(prev => ({ ...prev, [field]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setIsLoading(true)
    try {
      const result = await createClient({
        id_number: formData.idNumber,
        full_name: formData.fullName,
        phone_number: formData.phone,
        email: formData.email || undefined,
        street_name: formData.street,
        town: formData.town,
        province: formData.province,
        postal_code: formData.postalCode,
        country: formData.country
      })

      if (!result.success) {
        throw new Error(result.error || 'Failed to create client')
      }

      toast.success("Client created successfully")
      setOpen(false)
      setFormData({
        idNumber: "",
        fullName: "",
        phone: "",
        email: "",
        street: "",
        town: "",
        province: "",
        postalCode: "",
        country: ""
      })
      
      // Refresh the clients list
      if (onClientCreated) {
        onClientCreated()
      } else {
        router.refresh()
      }
    } catch (error) {
      console.error('Error creating client:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create client')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>Create Client</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Create New Client</DialogTitle>
          <DialogDescription>
            Add a new client to the system. All fields except email are required.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            {/* Personal Information Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Personal Information</h4>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={handleChange('fullName')}
                    placeholder="John Doe"
                    required
                    className="w-full"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="idNumber">ID Number</Label>
                    <Input
                      id="idNumber"
                      value={formData.idNumber}
                      onChange={handleChange('idNumber')}
                      placeholder="ID Number"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange('phone')}
                      placeholder="+27 12 345 6789"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange('email')}
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Address Section */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Address Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="street">Street</Label>
                  <Input
                    id="street"
                    value={formData.street}
                    onChange={handleChange('street')}
                    placeholder="123 Main St"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="town">Town/City</Label>
                  <Input
                    id="town"
                    value={formData.town}
                    onChange={handleChange('town')}
                    placeholder="Johannesburg"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="province">Province</Label>
                  <Input
                    id="province"
                    value={formData.province}
                    onChange={handleChange('province')}
                    placeholder="Gauteng"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange('postalCode')}
                    placeholder="2000"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={handleChange('country')}
                    placeholder="South Africa"
                    required
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
