import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchLoanPaymentHistory, type PaymentHistoryItem } from "@/actions/loans";

interface LatestLoanPaymentsProps {
  page?: number;
  limit?: number;
}

function formatCurrencyZAR(value: number): string {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(value);
}

function formatDate(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("en-ZA", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function PaymentRow({ item }: { item: PaymentHistoryItem }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex flex-col">
        <span className="text-sm font-medium">{formatCurrencyZAR(item.payment_amount)}</span>
        <span className="text-xs text-muted-foreground">{formatDate(item.created_at || item.payment_date)}</span>
        <span className="text-xs text-muted-foreground">Quote: {item.quote_number ?? "-"}</span>
      </div>
    </div>
  );
}

export async function LatestLoanPayments({ page = 1, limit = 5 }: LatestLoanPaymentsProps) {
  const max = 5;
  const effectiveLimit = Math.min(limit ?? max, max);
  const { data, pagination } = await fetchLoanPaymentHistory({ page, limit: effectiveLimit, includeLoan: true, date_order: "desc" });
  const items: PaymentHistoryItem[] = Array.isArray(data) ? data : [];

  return (
    <Card className="bg-stone-900 text-white">
      <CardHeader>
        <CardTitle>Latest Loan Payments</CardTitle>
        <CardDescription>
          Showing {Math.min(items.length, 5)} of {pagination.total}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="text-sm text-muted-foreground">No recent loan payments</div>
        ) : (
          <div className="divide-y divide-stone-800">
            {items.slice(0, 5).map((item) => (
              <PaymentRow key={item.id} item={item} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
