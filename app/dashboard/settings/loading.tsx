import { CardSkeleton } from "@/components/skeletons"

export default function SettingsLoading() {
  return (
    <div className="space-y-6 mt-10">
      <CardSkeleton />
      <div className="grid gap-6 md:grid-cols-2">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  )
}
