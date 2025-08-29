import { AuthButton } from "@/components/auth/authButton";

export function HomeHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <AuthButton />
          </div>
          <div className="text-sm text-muted-foreground">Firearm Studio</div>
        </div>
      </div>
    </header>
  );
}
