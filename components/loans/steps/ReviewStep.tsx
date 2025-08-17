"use client"

import { useFormContext } from "react-hook-form"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { User, ReceiptText } from "lucide-react"
import { type LoanFormValues } from "@/lib/validation/loan"

interface ReviewStepProps {
  isSubmitted: boolean
}

export function ReviewStep({ isSubmitted }: ReviewStepProps) {
  const { watch } = useFormContext<LoanFormValues>()
  
  const formData = watch()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-foreground">Quote</Badge>
          <span className="font-mono text-sm text-foreground">
            {formData.quoteNumber || 'Not provided'}
          </span>
        </div>
        {isSubmitted ? (
          <Badge className="bg-emerald-600">Submitted</Badge>
        ) : (
          <Badge variant="outline" className="border-foreground/20 text-foreground">Draft</Badge>
        )}
      </div>

      <Separator />

      <div>
        <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <User className="h-4 w-4" />
          Customer Details
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Full Name:</span>
            <p className="font-medium text-foreground">{formData.fullName}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Email:</span>
            <p className="font-medium text-foreground">{formData.email || 'Not provided'}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Phone:</span>
            <p className="font-medium text-foreground">{formData.phoneNumber}</p>
          </div>
          <div>
            <span className="text-muted-foreground">ID Number:</span>
            <p className="font-medium text-foreground">{formData.idNumber}</p>
          </div>
        </div>
        {(formData.street || formData.town || formData.province || formData.postalCode || formData.country) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mt-4">
            {formData.street && (
              <div>
                <span className="text-muted-foreground">Street:</span>
                <p className="font-medium text-foreground">{formData.street}</p>
              </div>
            )}
            {formData.town && (
              <div>
                <span className="text-muted-foreground">Town:</span>
                <p className="font-medium text-foreground">{formData.town}</p>
              </div>
            )}
            {formData.province && (
              <div>
                <span className="text-muted-foreground">Province:</span>
                <p className="font-medium text-foreground">{formData.province}</p>
              </div>
            )}
            {formData.postalCode && (
              <div>
                <span className="text-muted-foreground">Postal Code:</span>
                <p className="font-medium text-foreground">{formData.postalCode}</p>
              </div>
            )}
            {formData.country && (
              <div>
                <span className="text-muted-foreground">Country:</span>
                <p className="font-medium text-foreground">{formData.country}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <Separator />

      <div>
        <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <ReceiptText className="h-4 w-4" />
          Loan Terms
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Loan Start Date:</span>
            <p className="font-medium text-foreground">{formData.loanStartDate || 'Not set'}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Firearm Cost:</span>
            <p className="font-medium text-foreground">{formData.firearmCost}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Deposit Amount:</span>
            <p className="font-medium text-foreground">{formData.depositAmount || '0'}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Loan Amount:</span>
            <p className="font-medium text-foreground">{formData.loanAmount}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Loan Duration:</span>
            <p className="font-medium text-foreground">{formData.loanDuration} months</p>
          </div>
          <div>
            <span className="text-muted-foreground">Interest Rate:</span>
            <p className="font-medium text-foreground">{formData.interestRate || '0'}%</p>
          </div>
        </div>
      </div>
    </div>
  )
}
