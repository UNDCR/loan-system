import { Metadata } from "next"
import { StorageClient } from "@/components/storage/storageClient"
import { fetchStorageEntries } from "@/actions/storage"

export const metadata: Metadata = {
  title: "Storage | Firearm Studio",
  description: "View firearms currently in storage",
}

interface StoragePageProps {
  searchParams: Promise<{
    page?: string
    limit?: string
    search?: string
    storage_type?: string
    sort?: "asc" | "desc"
  }>
}

export default async function StoragePage({ searchParams }: StoragePageProps) {
  const params = await searchParams

  const page = params.page ? parseInt(params.page, 10) : 1
  const limit = params.limit ? parseInt(params.limit, 10) : 20
  const search = params.search || undefined
  const storageType = params.storage_type || undefined
  const sort = params.sort || "desc"

  const { data: entries, pagination } = await fetchStorageEntries({
    page,
    limit,
    search,
    storage_type: storageType,
    sort
  })

  return (
    <StorageClient
      entries={entries}
      pagination={pagination}
      initialSearch={search}
      initialStorageType={storageType}
      initialSort={sort}
    />
  )
}
