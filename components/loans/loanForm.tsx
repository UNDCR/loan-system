"use client"

import { useCallback, useMemo, useState } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, ArrowLeft, ArrowRight, XIcon, Loader2, User, ReceiptText } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import { LoanSubmission } from "@/lib/types"
import { toast } from "sonner"
import { createLoan } from "@/actions/createLoan"
import { loanFormSchema, type LoanFormValues, customerStepFields, termsStepFields } from "@/lib/validation/loan"
import { CustomerStep } from "./steps/CustomerStep"
import { TermsStep } from "./steps/TermsStep"
import { ReviewStep } from "./steps/ReviewStep"
import { useRouter } from "next/navigation"

const steps = [
  { id: 1, title: "Customer", icon: User, description: "Basic customer details" },
  { id: 2, title: "Terms", icon: ReceiptText, description: "Financial details" },
  { id: 3, title: "Review", icon: CheckCircle, description: "Review all details" },
] as const

const LoanFormContent = ({ onSave, onSubmit }: LoanCreationFormProps) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const form = useForm({
    resolver: zodResolver(loanFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phoneNumber: "",
      idNumber: "",
      street: "",
      town: "",
      province: "",
      postalCode: "",
      country: "",
      quoteNumber: "",
      loanStartDate: "",
      firearmCost: "",
      depositAmount: "",
      loanAmount: "",
      loanDuration: "3",
      interestRate: "",
      selectedCustomerId: "",
    },
  })

  const { handleSubmit, trigger } = form

  const progressValue = useMemo(() => (currentStep / steps.length) * 100, [currentStep])

  const handleNext = useCallback(async () => {
    let fieldsToValidate: (keyof LoanFormValues)[] = []

    if (currentStep === 1) {
      fieldsToValidate = [...customerStepFields]
    } else if (currentStep === 2) {
      fieldsToValidate = [...termsStepFields]
    }

    const isValid = await trigger(fieldsToValidate)
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length))
    }
  }, [currentStep, trigger])

  const handlePrevious = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }, [])

  const handleCreateAnother = useCallback(() => {
    setIsSubmitted(false)
    setCurrentStep(1)
    form.reset()
  }, [form])

  const handleCreateNewLoan = useCallback(async (formData: LoanFormValues, customerId: string): Promise<{ id: string }> => {
    try {
      const response = await createLoan({
        firearm_cost: parseFloat(formData.firearmCost),
        loan_amount: parseFloat(formData.loanAmount),
        duration: parseInt(formData.loanDuration, 10),
        interest: parseFloat(formData.interestRate || "0"),
        deposit_amount: parseFloat(formData.depositAmount || "0"),
        start_date: formData.loanStartDate,
        customer_id: customerId,
        quote_number: formData.quoteNumber,
        status: "Grace",
      });

      if (!response.success) {
        const errorMessage = response.error || 'Failed to create loan'
        if (errorMessage.toLowerCase().includes('quote number')) {
          form.setError('quoteNumber', { type: 'server', message: errorMessage })
          setCurrentStep(2)
        }
        throw new Error(errorMessage)
      }

      if (!response.data?.id) {
        throw new Error('Invalid response from server: missing loan ID')
      }

      return { id: response.data.id }
    } catch (error) {
      console.error('Error in handleCreateNewLoan:', error)
      throw error
    }
  }, [form, setCurrentStep]) as (formData: LoanFormValues, customerId: string) => Promise<{ id: string }>
    ;

  const onSubmitForm = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (currentStep < steps.length) {
      await handleNext()
      return
    }

    handleSubmit(async (data) => {
      setIsSubmitting(true)
      const formData = data as unknown as LoanFormValues

      try {
        if (!formData.selectedCustomerId) {
          throw new Error('Please select an existing client');
        }

        const customerId = formData.selectedCustomerId;
        await handleCreateNewLoan(formData, customerId);

        const payload: LoanSubmission = {
          fullName: formData.fullName,
          email: formData.email || "",
          phoneNumber: formData.phoneNumber || "",
          idNumber: formData.idNumber || "",
          street: formData.street || "",
          town: formData.town || "",
          province: formData.province || "",
          postalCode: formData.postalCode || "",
          country: formData.country || "",
          quoteNumber: formData.quoteNumber || "",
          loanStartDate: formData.loanStartDate,
          firearmCost: formData.firearmCost,
          depositAmount: formData.depositAmount || "",
          loanAmount: formData.loanAmount,
          loanDuration: formData.loanDuration,
          interestRate: formData.interestRate || "0",
          loanCreatedAt: new Date().toISOString(),
          daysActive: 0,
          loanProgress: 0,
          remainingAmount: formData.loanAmount,
          status: "Pending Payment",
        };

        onSave?.(payload);
        onSubmit?.(payload);
        setIsSubmitted(true);
        toast.success('Loan application submitted successfully');

      } catch (error) {
        console.error('Error in form submission:', error);
        const errorMessage = error instanceof Error ? error.message : 'An error occurred while submitting the form';
        toast.error(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    })()
  }, [currentStep, handleSubmit, handleNext, handleCreateNewLoan, onSave, onSubmit])

  return (
    <FormProvider {...form}>
      <Card className="border-foreground/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl font-semibold text-foreground">New Loan Application</CardTitle>
              <p className="text-sm text-muted-foreground">Create a new loan in a few simple steps</p>
            </div>
            <DialogClose asChild>
              <Button variant="ghost" size="icon" aria-label="Close dialog">
                <XIcon className="h-5 w-5" />
              </Button>
            </DialogClose>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Progress value={progressValue} className="h-2" />

          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              return (
                <div key={step.id} className="flex-1 flex items-center">
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center border ${isActive
                        ? "bg-primary text-primary-foreground border-primary"
                        : isCompleted
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "bg-background border-foreground/20 text-foreground"
                        }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="hidden md:block">
                      <div className="text-sm font-medium text-foreground">{step.title}</div>
                      <div className="text-xs text-muted-foreground">{step.description}</div>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="flex-1 mx-2 h-[2px] bg-foreground/10" />
                  )}
                </div>
              );
            })}
          </div>

          <form onSubmit={onSubmitForm} className="space-y-6">

            {currentStep === 1 && <CustomerStep />}

            {currentStep === 2 && <TermsStep />}

            {currentStep === 3 && <ReviewStep isSubmitted={isSubmitted} />}

            <div className="flex items-center justify-between pt-4 gap-4">
              <div className="flex-1">
                <Button type="button" variant="outline" onClick={handlePrevious} disabled={currentStep === 1} className="border-foreground/20 text-foreground hover:bg-foreground/5">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </div>

              {isSubmitted ? (
                <div className="flex-1 flex justify-end">
                  <Button type="button" variant="ghost" onClick={handleCreateAnother} className="text-foreground/80">
                    Create another application
                  </Button>
                </div>
              ) : (
                <div className="flex-1 flex justify-end">
                  <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : currentStep < steps.length ? (
                      <>
                        Next <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    ) : (
                      'Submit Application'
                    )}
                  </Button>
                </div>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </FormProvider>
  );
}

interface LoanCreationFormProps {
  onSave?: (data: LoanSubmission) => void;
  onSubmit?: (data: LoanSubmission) => void;
}

interface LoanFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (data: LoanSubmission) => void;
  onSubmit?: (data: LoanSubmission) => void;
  onCancel?: () => void;
  trigger?: React.ReactNode;
}

export function LoanFormDialog({
  open,
  onOpenChange,
  onSave,
  onSubmit,
  onCancel,
  trigger = <Button>New Loan Application</Button>,
}: LoanFormDialogProps) {
  const router = useRouter()
  const handleDialogOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (!isOpen) {
      onCancel?.();
    }
  };

  const handleFormSubmit = (data: LoanSubmission) => {
    onSubmit?.(data);
    onOpenChange(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl p-0" showCloseButton={false}>
        <DialogTitle className="sr-only">Loan Application</DialogTitle>
        <LoanFormContent
          onSave={onSave}
          onSubmit={handleFormSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}
