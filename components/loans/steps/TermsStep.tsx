"use client"

import { useEffect } from "react"
import { useFormContext } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { calculateLoanAmount } from "@/lib/utils"
import { type LoanFormValues } from "@/lib/validation/loan"

export function TermsStep() {
  const { register, watch, setValue, formState: { errors } } = useFormContext<LoanFormValues>()

  const firearmCost = watch("firearmCost")
  const depositAmount = watch("depositAmount")

  useEffect(() => {
    const loanAmount = calculateLoanAmount(firearmCost || "", depositAmount || "")
    setValue("loanAmount", loanAmount)
  }, [firearmCost, depositAmount, setValue])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm text-foreground mb-2">Quote Number</label>
        <Input
          type="text"
          placeholder="Enter quote number"
          {...register("quoteNumber", {
            onChange: (e) => {
              e.target.value = e.target.value.replace(/[^0-9.]/g, '')
            }
          })}
          inputMode="numeric"
          pattern="[0-9.]*"
        />
        {errors.quoteNumber && (
          <p className="text-sm text-red-500 mt-1">{errors.quoteNumber.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm text-foreground mb-2">Loan Start Date</label>
        <Input
          type="date"
          placeholder="Select start date"
          {...register("loanStartDate")}
        />
        {errors.loanStartDate && (
          <p className="text-sm text-red-500 mt-1">{errors.loanStartDate.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm text-foreground mb-2">Firearm Cost</label>
        <Input
          type="text"
          placeholder="500"
          {...register("firearmCost", {
            onChange: (e) => {
              e.target.value = e.target.value.replace(/[^0-9.]/g, '')
            }
          })}
          inputMode="numeric"
          pattern="[0-9.]*"
        />
        {errors.firearmCost && (
          <p className="text-sm text-red-500 mt-1">{errors.firearmCost.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm text-foreground mb-2">Deposit Amount</label>
        <Input
          type="text"
          placeholder="100"
          {...register("depositAmount", {
            onChange: (e) => {
              e.target.value = e.target.value.replace(/[^0-9.]/g, '')
            }
          })}
          inputMode="numeric"
          pattern="[0-9.]*"
        />
        {errors.depositAmount && (
          <p className="text-sm text-red-500 mt-1">{errors.depositAmount.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm text-foreground mb-2">Loan Amount</label>
        <Input
          type="text"
          placeholder="300"
          {...register("loanAmount")}
          readOnly
          inputMode="numeric"
          pattern="[0-9.]*"
        />
        {errors.loanAmount && (
          <p className="text-sm text-red-500 mt-1">{errors.loanAmount.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm text-foreground mb-2">Loan Duration (months)</label>
        <Input
          type="text"
          placeholder="12"
          {...register("loanDuration", {
            onChange: (e) => {
              e.target.value = e.target.value.replace(/[^0-9]/g, '')
            }
          })}
          inputMode="numeric"
          pattern="[0-9]*"
        />
        {errors.loanDuration && (
          <p className="text-sm text-red-500 mt-1">{errors.loanDuration.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm text-foreground mb-2">Interest Rate (%)</label>
        <Input
          type="text"
          placeholder="0"
          {...register("interestRate", {
            onChange: (e) => {
              e.target.value = e.target.value.replace(/[^0-9.]/g, '')
            }
          })}
          inputMode="decimal"
          pattern="[0-9.]*"
        />
        {errors.interestRate && (
          <p className="text-sm text-red-500 mt-1">{errors.interestRate.message}</p>
        )}
      </div>
    </div>
  )
}
