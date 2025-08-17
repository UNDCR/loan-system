import React from "react"

type DivProps = React.HTMLAttributes<HTMLDivElement>

export function CardSkeleton(props: DivProps) {
  return (
    <div
      {...props}
      className={(props.className ?? "") + " rounded-lg border bg-card text-card-foreground shadow-sm animate-pulse"}
    >
      <div className="p-4 border-b">
        <div className="h-5 w-40 bg-muted rounded" />
        <div className="mt-2 h-4 w-64 bg-muted rounded" />
      </div>
      <div className="p-4">
        <div className="h-40 w-full bg-muted rounded" />
      </div>
    </div>
  )
}

export function HeaderBarSkeleton(props: DivProps) {
  return (
    <div {...props} className={(props.className ?? "") + " flex items-center justify-between gap-4 animate-pulse"}>
      <div className="h-6 w-48 bg-muted rounded" />
      <div className="flex items-center gap-2">
        <div className="h-9 w-44 bg-muted rounded" />
        <div className="h-9 w-24 bg-muted rounded" />
        <div className="h-9 w-9 bg-muted rounded" />
      </div>
    </div>
  )
}

export function GridSkeleton({ count = 6, className = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4" }: { count?: number; className?: string }) {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-lg border bg-card shadow-sm p-4 animate-pulse">
          <div className="h-4 w-1/2 bg-muted rounded" />
          <div className="mt-3 h-24 w-full bg-muted rounded" />
          <div className="mt-3 h-4 w-1/3 bg-muted rounded" />
        </div>
      ))}
    </div>
  )
}

export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-lg border bg-card shadow-sm p-4 animate-pulse">
          <div className="flex items-center justify-between gap-4">
            <div className="h-5 w-40 bg-muted rounded" />
            <div className="h-6 w-24 bg-muted rounded" />
          </div>
          <div className="mt-3 h-16 w-full bg-muted rounded" />
        </div>
      ))}
    </div>
  )
}

export function ChartCardSkeleton() {
  return (
    <div className="rounded-lg border bg-stone-900 text-white shadow-sm animate-pulse">
      <div className="flex items-center justify-between p-5 border-b">
        <div>
          <div className="h-5 w-32 bg-white/40 rounded" />
          <div className="mt-2 h-4 w-64 bg-white/20 rounded" />
          <div className="mt-1 h-4 w-40 bg-white/20 rounded" />
        </div>
        <div className="h-9 w-40 bg-white/20 rounded" />
      </div>
      <div className="p-4 sm:p-6">
        <div className="h-[300px] w-full bg-white/10 rounded" />
      </div>
    </div>
  )
}
