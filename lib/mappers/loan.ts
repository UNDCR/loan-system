import { EnrichedLoan, LoanData } from "@/lib/types";

export function mapLoanToLoanData(row: EnrichedLoan): LoanData {
  const start = new Date(row.start_date);
  const now = new Date();
  const daysActive = Math.max(0, Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  const durationMonths = parseInt(row.duration ?? "0", 10) || 0;
  const loanAmount = Number(row.loan_amount ?? 0);
  const remain = Number(row.remain_amount ?? loanAmount);
  const progress = loanAmount > 0 ? Math.round(((loanAmount - remain) / loanAmount) * 100) : 0;
  const cust = row.customer ?? row.customers ?? null;
  const fire = row.firearm ?? row.firearms ?? null;
  const makeModel = fire
    ? ("make_model" in fire
        ? (fire.make_model ?? "")
        : ("model" in fire ? (fire.model ?? "") : ""))
    : "";
  const stockNumber = fire && ("stock_number" in fire) ? (fire.stock_number ?? "") : "";
  const serialNumber = fire && ("serial_number" in fire) ? (fire.serial_number ?? "") : "";
  return {
    loanId: row.id,
    customerId: (row.customer_id ?? (row.customer?.id ?? row.customers?.id) ?? ""),
    quoteNumber: row.quote_number ?? "",
    firearmCost: Number(row.firearm_cost ?? 0),
    depositAmount: row.deposit_amount ?? undefined,
    loanAmount,
    remainingAmount: remain,
    loanDuration: durationMonths,
    loanCreatedAt: row.start_date,
    daysActive,
    loanProgress: progress,
    fullName: cust?.full_name ?? "",
    email: cust?.email ?? "",
    phoneNumber: cust?.phone_number ?? "",
    idNumber: cust?.id_number ?? "",
    interestRate: Number(row.interest ?? 0),
    penaltyAmount: undefined,
    firearmDetails: {
      makeModel,
      stockNumber,
      serialNumber,
    },
    status: (row.status as LoanData["status"]) ?? "Pending Payment",
  };
}
