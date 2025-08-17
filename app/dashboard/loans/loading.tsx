import { HeaderBarSkeleton, ListSkeleton } from "@/components/skeletons"

export default function LoansLoading() {
  return (
    <div className="space-y-6">
      <HeaderBarSkeleton />
      <ListSkeleton count={6} />
    </div>
  )
}
