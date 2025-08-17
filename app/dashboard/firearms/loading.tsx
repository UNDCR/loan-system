import { GridSkeleton, HeaderBarSkeleton } from "@/components/skeletons"

export default function FirearmsLoading() {
  return (
    <div className="space-y-6">
      <HeaderBarSkeleton />
      <GridSkeleton count={9} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4" />
    </div>
  )
}
