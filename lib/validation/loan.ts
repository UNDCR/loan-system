import { z } from "zod"

const phoneRegex = /^[0-9\s\-\+\(\)]+$/
const idNumberRegex = /^[A-Za-z0-9\-]+$/

export const loanFormSchema = z.object({
  fullName: z.string().min(1, "Full name is required").max(100, "Full name must be less than 100 characters"),

  email: z.string().email("Invalid email format").optional().or(z.literal("")),

  phoneNumber: z.string()
    .min(1, "Phone number is required")
    .regex(phoneRegex, "Invalid phone number format")
    .max(20, "Phone number must be less than 20 characters"),

  idNumber: z.string()
    .min(1, "ID number is required")
    .regex(idNumberRegex, "ID number can only contain letters, numbers, and hyphens")
    .max(20, "ID number must be less than 20 characters"),

  street: z.string().max(200, "Street address must be less than 200 characters").optional(),

  town: z.string().max(100, "Town must be less than 100 characters").optional(),

  province: z.string().max(100, "Province must be less than 100 characters").optional(),

  postalCode: z.string()
    .regex(/^[0-9]*$/, "Postal code must contain only numbers")
    .max(10, "Postal code must be less than 10 characters")
    .optional(),

  country: z.string().max(100, "Country must be less than 100 characters").optional(),

  quoteNumber: z.string()
    .regex(/^[0-9.]*$/, "Quote number must contain only numbers and periods")
    .optional(),

  loanStartDate: z.string()
    .min(1, "Loan start date is required")
    .refine((date) => {
      const parsed = new Date(date)
      return !isNaN(parsed.getTime())
    }, "Invalid date format"),

  firearmCost: z.string()
    .min(1, "Firearm cost is required")
    .regex(/^[0-9.]+$/, "Firearm cost must be a valid number")
    .refine((val) => {
      const num = parseFloat(val)
      return !isNaN(num) && num > 0
    }, "Firearm cost must be greater than 0")
    .refine((val) => {
      const num = parseFloat(val)
      return num <= 1000000
    }, "Firearm cost cannot exceed R1,000,000"),

  depositAmount: z.string()
    .regex(/^[0-9.]*$/, "Deposit amount must be a valid number")
    .refine((val) => {
      if (!val) return true
      const num = parseFloat(val)
      return !isNaN(num) && num >= 0
    }, "Deposit amount must be 0 or greater")
    .optional(),

  loanAmount: z.string()
    .min(1, "Loan amount is required")
    .regex(/^[0-9.]+$/, "Loan amount must be a valid number")
    .refine((val) => {
      const num = parseFloat(val)
      return !isNaN(num) && num > 0
    }, "Loan amount must be greater than 0"),

  loanDuration: z.string()
    .min(1, "Loan duration is required")
    .regex(/^[0-9]+$/, "Loan duration must be a whole number")
    .refine((val) => {
      const num = parseInt(val, 10)
      return !isNaN(num) && num >= 1 && num <= 120
    }, "Loan duration must be between 1 and 120 months"),

  interestRate: z.string()
    .regex(/^[0-9.]*$/, "Interest rate must be a valid number")
    .refine((val) => {
      if (!val) return true
      const num = parseFloat(val)
      return !isNaN(num) && num >= 0 && num <= 100
    }, "Interest rate must be between 0% and 100%")
    .optional(),

  selectedCustomerId: z.string().min(1, "Please select an existing client"),
}).refine((data) => {
  if (data.depositAmount && data.firearmCost) {
    const deposit = parseFloat(data.depositAmount)
    const firearm = parseFloat(data.firearmCost)
    return deposit <= firearm
  }
  return true
}, {
  message: "Deposit amount cannot exceed firearm cost",
  path: ["depositAmount"]
})

export type LoanFormValues = z.infer<typeof loanFormSchema>

export const customerStepFields = [
  "selectedCustomerId"
] as const

export const termsStepFields = [
  "quoteNumber",
  "loanStartDate",
  "firearmCost",
  "depositAmount",
  "loanAmount",
  "loanDuration",
  "interestRate"
] as const

export type CustomerStepField = typeof customerStepFields[number]
export type TermsStepField = typeof termsStepFields[number]
