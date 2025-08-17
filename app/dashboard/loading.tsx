import { ChartCardSkeleton } from "@/components/skeletons"

export default function DashboardLoading() {
  return (
    <div className="flex-1 w-full flex flex-col gap-6 mt-10">
      <div className="w-full">
        <ChartCardSkeleton />
      </div>
    </div>
  )
}
