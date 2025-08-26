import { Metadata } from "next"
import { ClientsClient } from "@/components/clients/clientsClient"
import { fetchClients } from "@/actions/clients"

export const metadata: Metadata = {
  title: "Clients | Firearm Firearm Suite",
  description: "Browse and search clients",
}

interface ClientsPageProps {
  searchParams: Promise<{
    page?: string
    limit?: string
    search?: string
    sortCredit?: "asc" | "desc"
  }>
}

export default async function ClientsPage({ searchParams }: ClientsPageProps) {
  const params = await searchParams

  const page = params.page ? parseInt(params.page, 10) : 1
  const limit = params.limit ? parseInt(params.limit, 10) : 20
  const search = params.search || undefined
  const sortCredit = params.sortCredit || "desc"

  const { data: clients, pagination } = await fetchClients({
    page,
    limit,
    search,
    sortCredit
  })

  return (
    <ClientsClient
      clients={clients}
      pagination={pagination}
      initialSearch={search}
    />
  )
}
