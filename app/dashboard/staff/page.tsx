import { Metadata } from "next"
import { fetchStaff } from "@/actions/staff"
import { StaffClient } from "@/components/staffMembers/staffClient"

export const metadata: Metadata = {
  title: "Staff | Firearm Suite",
  description: "Manage and view staff members",
}

export default async function StaffPage() {
  const entries = await fetchStaff()
  return <StaffClient entries={entries} />
}
