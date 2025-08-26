"use client"

import { useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { ClientsHeader } from "@/components/clients/clientsHeader"
import { ClientCard } from "@/components/clients/clientCard"
import { Pagination } from "@/components/ui/pagination"
import { ClientData, PaginationMetadata } from "@/lib/types"

interface ClientsClientProps {
  clients: ClientData[]
  pagination: PaginationMetadata
  initialSearch?: string
}

export function ClientsClient({ clients: initialClients, pagination, initialSearch }: ClientsClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(initialSearch || "")
  const [searchResults, setSearchResults] = useState<ClientData[] | null>(null)

  const refreshClients = async () => {
    try {
      setSearchResults(null)
      setSearchQuery("")

      // Update URL to remove search parameter and refresh the page
      const params = new URLSearchParams(searchParams.toString())
      params.delete("search")
      router.push(`/dashboard/clients?${params.toString()}`)
      router.refresh()
    } catch (error) {
      console.error("Failed to refresh clients:", error)
      toast.error("Failed to refresh clients list")
    }
  }

  const handleAddCredit = ({ idNumber, amount }: { idNumber: string; amount: number }) => {
    // Credit addition will be handled by the server, so we just need to refresh
    console.log("Credit added for client:", idNumber, "amount:", amount)
  }

  const handleCreditSuccess = async () => {
    await refreshClients()
  }

  const handleSearch = async (query: string) => {
    setSearchQuery(query)

    const params = new URLSearchParams(searchParams.toString())

    if (!query.trim()) {
      setSearchResults(null)
      params.delete("search")
      params.delete("page") // Reset to first page when clearing search
      router.push(`/dashboard/clients?${params.toString()}`)
      return
    }

    params.set("search", query)
    params.delete("page") // Reset to first page when searching
    router.push(`/dashboard/clients?${params.toString()}`)
  }

  const list = useMemo(() => {
    return searchResults !== null ? searchResults : initialClients
  }, [initialClients, searchResults])

  const handleSortChange = async (order: "asc" | "desc") => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("sortCredit", order)
    params.delete("page")
    router.push(`/dashboard/clients?${params.toString()}`)
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", String(page))
    router.push(`/dashboard/clients?${params.toString()}`)
  }

  return (
    <div className="space-y-6">
      <ClientsHeader
        onSearch={handleSearch}
        onSortChange={handleSortChange}
        onAddCredit={handleAddCredit}
        onCreditSuccess={handleCreditSuccess}
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
      {searchResults === null && pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          onPageChange={handlePageChange}
          className="mt-6"
        />
      )}
    </div>
  )
}
