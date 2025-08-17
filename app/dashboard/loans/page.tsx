import { Metadata } from "next"
import { LoansClient } from "@/components/loans/loanClient";
import { fetchLoans } from "@/actions/loans";

export const metadata: Metadata = {
  title: "Loans | Firearm Firearm Suite",
  description: "Manage and track all firearm loans in one place",
};

export default async function LoansPage() {
  const { data } = await fetchLoans({ page: 1, limit: 100 });
  return <LoansClient loans={data} />
}
