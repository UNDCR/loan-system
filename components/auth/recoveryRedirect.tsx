"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function RecoveryRedirect() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash;
    if (!hash) return;
    const isRecovery = /(?:^|[&#?])type=recovery(?:&|$)/.test(hash);
    if (!isRecovery) return;
    if (pathname === "/auth/update-password") return;
    router.replace(`/auth/update-password${hash}`);
  }, [pathname, router]);

  return null;
}
