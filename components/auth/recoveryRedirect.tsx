"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function RecoveryRedirect() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash;
    const search = window.location.search;

    const hasHash = !!hash;
    const hasSearch = !!search;

    const isRecoveryInHash = hasHash && /(?:^|[&#?])type=recovery(?:&|$)/.test(hash);
    const isRecoveryInSearch = hasSearch && new URLSearchParams(search).get("type") === "recovery";

    if (!isRecoveryInHash && !isRecoveryInSearch) return;
    if (pathname === "/auth/update-password") return;

    const suffix = isRecoveryInHash ? hash : search;
    router.replace(`/auth/update-password${suffix}`);
  }, [pathname, router]);

  return null;
}
