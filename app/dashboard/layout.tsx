"use client"

import { ThemeSwitcher } from "@/components/themeSwitcher";
import { Sidebar } from "@/components/sidebar/sidebar";
import { Button } from "@/components/ui/button";
import { RotateCw, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleRefresh = () => {
    startTransition(() => {
      try {
        router.refresh();
        toast.success("Data refreshed");
      } catch (e) {
        const message = e instanceof Error ? e.message : "Refresh failed";
        toast.error(message);
      }
    });
  };

  return (
    <div className="flex min-h-screen">
      <div className="hidden md:block fixed top-0 left-0 h-full w-64 z-10">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col min-h-screen md:pl-64">
        <header className="fixed top-0 right-0 left-0 md:left-64 h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
          <div className="flex h-full items-center justify-between px-4 lg:px-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={isPending}
                aria-label="Refresh data"
                title="Refresh data"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : (
                  <RotateCw className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
              <ThemeSwitcher />
            </div>
          </div>
        </header>
        <main className="flex-1 pt-14 p-4 lg:p-6 overflow-auto">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>


    </div>
  );
}

