export default function AuthLoading() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-4 animate-pulse">
        <div className="h-8 w-1/2 bg-muted rounded" />
        <div className="h-10 w-full bg-muted rounded" />
        <div className="h-10 w-full bg-muted rounded" />
        <div className="h-4 w-2/3 bg-muted rounded" />
      </div>
    </main>
  )
}
