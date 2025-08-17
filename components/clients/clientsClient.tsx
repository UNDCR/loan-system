"use client"

import { useMemo, useState } from "react"
import { toast } from "sonner"
import { ClientsHeader } from "@/components/clients/clientsHeader"
import { ClientCard } from "@/components/clients/clientCard"
import { ClientData } from "@/lib/types"
import { fetchClients } from "@/actions/clients"

export function ClientsClient({ clients: initialClients }: { clients: ClientData[] }) {
  const [clientsState, setClientsState] = useState<ClientData[]>(() => initialClients)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<ClientData[] | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  const refreshClients = async () => {
    try {
      const { data } = await fetchClients({ page: 1, limit: 50, sortCredit: sortOrder })
      setClientsState(data)
      setSearchResults(null)
      setSearchQuery("")
    } catch (error) {
      console.error("Failed to refresh clients:", error)
      toast.error("Failed to refresh clients list")
    }
  }

  const handleAddCredit = ({ idNumber, amount }: { idNumber: string; amount: number }) => {
    setClientsState(prev => prev.map(c =>
      c.idNumber === idNumber
        ? { ...c, creditAmount: (c.creditAmount ?? 0) + amount }
        : c
    ))
  }

  const handleCreditSuccess = async () => {
    await refreshClients()
  }

  const handleSearch = async (query: string) => {
    setSearchQuery(query)

    if (!query.trim()) {
      setIsSearching(false)
      setSearchResults(null)
      return
    }

    try {
      setIsSearching(true)
      // Prefer server-side search via fetchClients to preserve API-level sorting capability
      const { data } = await fetchClients({ page: 1, limit: 50, search: query, sortCredit: sortOrder })
      setSearchResults(data)
    } catch (error) {
      console.error("Search failed:", error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const list = useMemo(() => {
    return searchResults !== null ? searchResults : clientsState
  }, [clientsState, searchResults])

  const handleSortChange = async (order: "asc" | "desc") => {
    setSortOrder(order)
    try {
      const { data } = await fetchClients({ page: 1, limit: 50, sortCredit: order, search: searchQuery || undefined })
      setClientsState(data)
      // ensure we reflect server-sorted results; clear client-side search cache to avoid local sorting
      if (searchQuery) {
        setSearchResults(data)
      } else {
        setSearchResults(null)
      }
    } catch (e) {
      console.error("Failed to apply sort on server:", e)
      toast.error("Failed to sort by credit")
    }
  }

  return (
    <div className="space-y-6">
      <ClientsHeader
        onSearch={handleSearch}
        onSortChange={handleSortChange}
        onAddCredit={handleAddCredit}
        onCreditSuccess={handleCreditSuccess}
        isSearching={isSearching}
        searchQuery={searchQuery}
        onClientCreated={refreshClients}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.length ? (
          list.map((client, idx) => (
            <ClientCard
              key={`${client.idNumber}-${idx}`}
              client={client}
              onClientUpdated={refreshClients}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No clients found.
          </div>
        )}
      </div>
    </div>
  )
}
