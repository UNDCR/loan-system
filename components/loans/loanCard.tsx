"use client"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { CalendarDays, Clock, CreditCard, Banknote, Mail, Phone, User, IdCard, Target, Package } from "lucide-react"
import { LoanData, LoanStatus } from "@/lib/types"

export default function LoanCard({ loan }: { loan: LoanData }) {
  const getStatusColor = (status: LoanStatus) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border border-green-200"
      case "Pending Payment":
        return "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 border border-orange-200"
      case "Grace":
        return "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 border border-purple-200"
      case "Cancelled":
        return "bg-stone-900 dark:bg-stone-900 text-white dark:text-stone-100 border border-stone-800 dark:border-stone-700"
      case "Penalty":
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border border-red-200"
      default:
        return "bg-gray-100 dark:bg-gray-800/30 text-gray-800 dark:text-gray-200 border border-gray-200"
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "ZAR",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "-"
    const d = new Date(dateString)
    if (Number.isNaN(d.getTime())) return "-"
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const calculatePaidTime = (progress: number, totalMonths: number) => {
    const totalDays = totalMonths * 30
    const paidDays = Math.floor((progress / 100) * totalDays)
    const paidMonths = Math.floor(paidDays / 30)
    const remainingDays = paidDays % 30

    return {
      months: paidMonths,
      days: remainingDays,
      totalMonths,
      totalDays: Math.floor(totalDays),
    }
  }

  return (
    <Card className="w-full bg-white dark:bg-stone-900/95">
      <div className={`p-6 ${getStatusColor(loan.status)}`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Quote {loan.quoteNumber}</h2>
            <p className="text-sm opacity-90 text-muted-foreground">{loan.firearmDetails.makeModel}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`${getStatusColor(loan.status)} text-sm px-3 py-1`}>
              {loan.status}
            </Badge>
          </div>
        </div>
      </div>

      <CardContent className="p-6 space-y-6">
        {/* Loan Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-foreground">Loan Progress</span>
            <div className="text-right">
              <span className="text-sm font-bold text-foreground">
                {(() => {
                  const paidTime = calculatePaidTime(loan.loanProgress, loan.loanDuration)
                  return `${paidTime.months}m ${paidTime.days}d / ${paidTime.totalMonths}m`
                })()}
              </span>
              <div className="text-xs text-muted-foreground">{loan.loanProgress}% Complete</div>
            </div>
          </div>
          <Progress value={loan.loanProgress} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Start</span>
            <span>
              {(() => {
                const paidTime = calculatePaidTime(loan.loanProgress, loan.loanDuration)
                const remainingMonths = paidTime.totalMonths - paidTime.months
                const remainingDays = 30 - paidTime.days
                return remainingMonths > 0 || remainingDays > 0
                  ? `${remainingMonths}m ${remainingDays}d remaining`
                  : "Completed"
              })()}
            </span>
          </div>
        </div>

        {/* Financial Information */}
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[150px]">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-600 dark:text-blue-500 flex-shrink-0" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap">Firearm Cost</span>
              </div>
              <p className="text-lg font-bold text-foreground">{formatCurrency(loan.firearmCost)}</p>
            </div>
          </div>

          <div className="flex-1 min-w-[150px]">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-green-600 dark:text-green-500 flex-shrink-0" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap">Loan Amount</span>
              </div>
              <p className="text-lg font-bold text-foreground">{formatCurrency(loan.loanAmount)}</p>
            </div>
          </div>

          <div className="flex-1 min-w-[150px]">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Banknote className="h-4 w-4 text-orange-600 dark:text-orange-500 flex-shrink-0" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap">Remaining</span>
              </div>
              <p className="text-lg font-bold text-foreground">{formatCurrency(loan.remainingAmount)}</p>
            </div>
          </div>

          <div className="flex-1 min-w-[150px]">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-purple-600 dark:text-purple-500 flex-shrink-0" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap">Interest Rate</span>
              </div>
              <p className="text-lg font-bold text-foreground">{loan.interestRate}%</p>
            </div>
          </div>

          <div className="flex-1 min-w-[150px]">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Banknote className="h-4 w-4 text-red-600 dark:text-red-500 flex-shrink-0" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap">Penalty</span>
              </div>
              <p className="text-lg font-bold text-foreground">{formatCurrency(loan.penaltyAmount || 0)}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Loan Timeline */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-blue-600 dark:text-blue-500" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Created</span>
            </div>
            <p className="text-sm font-semibold text-foreground">{formatDate(loan.loanCreatedAt)}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-green-600 dark:text-green-500" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Days Active</span>
            </div>
            <p className="text-sm font-semibold text-foreground">{loan.daysActive} days</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-purple-600 dark:text-purple-500" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Duration</span>
            </div>
            <p className="text-sm font-semibold text-foreground">{loan.loanDuration} months</p>
          </div>
        </div>

        <Separator />

        {/* Customer Information */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600 dark:text-blue-500" />
            Customer Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-blue-600 dark:text-blue-500" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Full Name</span>
              </div>
              <p className="text-sm font-semibold text-foreground mt-1">{loan.fullName}</p>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-green-600 dark:text-green-500" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Phone</span>
              </div>
              <p className="text-sm font-semibold text-foreground mt-1">{loan.phoneNumber}</p>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-600 dark:text-blue-500" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Email</span>
              </div>
              <p className="text-sm font-semibold text-foreground mt-1">{loan.email}</p>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <IdCard className="h-4 w-4 text-purple-600 dark:text-purple-500" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">ID Number</span>
              </div>
              <p className="text-sm font-semibold text-foreground mt-1">{loan.idNumber}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Firearm Details */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <Package className="h-5 w-5 text-orange-600 dark:text-orange-500" />
            Firearm Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Make & Model</span>
              <p className="text-sm font-semibold text-foreground mt-1">{loan.firearmDetails.makeModel}</p>
            </div>
            <div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Stock Number</span>
              <p className="text-sm font-semibold text-foreground mt-1">{loan.firearmDetails.stockNumber}</p>
            </div>
            <div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Serial Number</span>
              <p className="text-sm font-semibold text-foreground mt-1">{loan.firearmDetails.serialNumber}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}