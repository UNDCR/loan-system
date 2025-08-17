import { Metadata } from "next"
import { StorageClient } from "@/components/storage/storageClient"
import { fetchStorageEntries } from "@/actions/storage"

export const metadata: Metadata = {
  title: "Storage | Firearm Suite",
  description: "View firearms currently in storage",
}

export default async function StoragePage() {
  const entries = await fetchStorageEntries({ page: 1, limit: 20 })
  return <StorageClient entries={entries} />
}
