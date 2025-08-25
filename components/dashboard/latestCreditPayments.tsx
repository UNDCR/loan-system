"use client"

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchDashboardSummary } from "@/actions/dashboard";
import { Loader2 } from "lucide-react";
import type { DashboardSummaryResponse } from "@/lib/types";

interface LatestCreditPaymentsProps {
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

function CreditPaymentRow({ item }: { item: CreditPaymentItem }) {
  const customerName = item.customers?.full_name || item.profiles?.full_name || "Unknown";

  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex flex-col">
        <span className="text-sm font-medium">{formatCurrencyZAR(item.credit_amount)}</span>
        <span className="text-xs text-muted-foreground">{formatDate(item.created_at)}</span>
        <span className="text-xs text-muted-foreground">
          Customer: {customerName}
        </span>
        {item.payment_type && (
          <span className="text-xs text-muted-foreground">
            Type: {item.payment_type}
          </span>
        )}
      </div>
    </div>
  );
}

export function LatestCreditPayments({ limit = 5 }: LatestCreditPaymentsProps) {
  const [data, setData] = useState<DashboardSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        const result = await fetchDashboardSummary();
        setData(result);
      } catch (err) {
        console.error("Failed to fetch dashboard summary:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch dashboard summary");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const items = data?.data?.recentPayments || [];
  const displayItems = items.slice(0, Math.min(limit, 5));
  const totalPayments = data?.data?.totalPayments || 0;

  if (isLoading) {
    return (
      <Card className="bg-stone-900 text-white">
        <CardHeader>
          <CardTitle>Latest Credit Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-stone-900 text-white">
        <CardHeader>
          <CardTitle>Latest Credit Payments</CardTitle>
          <CardDescription>Error loading data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-red-400">
            Failed to load credit payments: {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-stone-900 text-white">
      <CardHeader>
        <CardTitle>Latest Credit Payments</CardTitle>
        <CardDescription>
          Showing {Math.min(displayItems.length, 5)} of {totalPayments}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {displayItems.length === 0 ? (
          <div className="text-sm text-muted-foreground">No recent credit payments</div>
        ) : (
          <div className="divide-y divide-stone-800">
            {displayItems.map((item) => (
              <CreditPaymentRow key={item.id} item={item} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface CreditPaymentItem {
  id: string;
  created_at: string;
  credit_amount: number;
  payment_type: string | null;
  customers: {
    id: string;
    full_name: string;
    created_at: string;
  } | null;
  profiles: {
    id: string;
    full_name: string;
    created_at: string;
  } | null;
}