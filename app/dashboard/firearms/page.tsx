import { Metadata } from "next"
import { FirearmsClient } from "@/components/firearms/firearmsClient"
import { fetchFirearmsWithRelations } from "@/actions/firearms"

export const metadata: Metadata = {
  title: "Firearms | Firearm Firearm Suite",
  description: "Browse and search firearms",
}

export default async function FirearmsPage() {
  const firearms = await fetchFirearmsWithRelations()
  return <FirearmsClient firearms={firearms} />
}
