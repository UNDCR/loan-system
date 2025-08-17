import { Metadata } from "next"
import { ClientsClient } from "@/components/clients/clientsClient"
import { fetchClients } from "@/actions/clients"

export const metadata: Metadata = {
  title: "Clients | Firearm Firearm Suite",
  description: "Browse and search clients",
}

export default async function ClientsPage() {
  const { data } = await fetchClients({ page: 1, limit: 50, sortCredit: "desc" })
  return <ClientsClient clients={data} />
}
