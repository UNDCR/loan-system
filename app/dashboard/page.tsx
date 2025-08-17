import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { ChartAreaInteractive } from "@/components/dashboard/areaChart";
import { fetchLoanTrends } from "@/actions/dashboard";
import { LatestLoanPayments } from "@/components/dashboard/latestLoanPayments";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  const trends = await fetchLoanTrends();

  return (
    <div className="flex-1 w-full flex flex-col gap-6 mt-10">
      <div className="w-full">
        <ChartAreaInteractive data={trends.success ? trends.data : []} />
      </div>
      <div className="w-full">
        <LatestLoanPayments limit={5} />
      </div>
    </div>
  );
}
