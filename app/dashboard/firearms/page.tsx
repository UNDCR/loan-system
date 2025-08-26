import { Metadata } from "next"
import { FirearmsClient } from "@/components/firearms/firearmsClient"
import { fetchFirearmsPaginated, FirearmFilter } from "@/actions/firearms"

export const metadata: Metadata = {
  title: "Firearms | Firearm Firearm Suite",
  description: "Browse and search firearms",
}

interface FirearmsPageProps {
  searchParams: Promise<{
    booked_out?: string
    page?: string
    limit?: string
  }>
}

export default async function FirearmsPage({ searchParams }: FirearmsPageProps) {
  const params = await searchParams

  const filter: FirearmFilter = {}
  if (params.booked_out === "true") {
    filter.booked_out = true
  } else if (params.booked_out === "false") {
    filter.booked_out = false
  }

  const page = params.page ? parseInt(params.page, 10) : 1
  const limit = params.limit ? parseInt(params.limit, 10) : 20

  const { data: firearms, pagination } = await fetchFirearmsPaginated({
    page,
    limit,
    filter
  })

  return (
    <FirearmsClient
      firearms={firearms}
      pagination={pagination}
      initialFilter={params.booked_out}
    />
  )
}
