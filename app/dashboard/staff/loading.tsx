import { GridSkeleton, HeaderBarSkeleton } from "@/components/skeletons"

export default function StaffLoading() {
  return (
    <div className="space-y-6 mt-10">
      <HeaderBarSkeleton />
      <GridSkeleton count={8} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" />
    </div>
  )
}
