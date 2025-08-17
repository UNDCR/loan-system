"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, HandCoins, UserCog, Settings, Shield, LogOut, Package } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/authProvider";

const navigation: NavItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    name: "Loans",
    href: "/dashboard/loans",
    icon: <HandCoins className="h-5 w-5" />,
  },
  {
    name: "Clients",
    href: "/dashboard/clients",
    icon: <Users className="h-5 w-5" />,
  },
  {
    name: "Firearms",
    href: "/dashboard/firearms",
    icon: <Shield className="h-5 w-5" />,
  },
  {
    name: "Storage",
    href: "/dashboard/storage",
    icon: <Package className="h-5 w-5" />,
  },
  {
    name: "Staff",
    href: "/dashboard/staff",
    icon: <UserCog className="h-5 w-5" />,
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: <Settings className="h-5 w-5" />,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href;
  const router = useRouter();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
    } finally {
      router.replace("/auth/login");
    }
  };

  return (
    <div className="h-dvh hidden border-r bg-muted/40 md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <span>Firearm Suite</span>
          </Link>
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                  isActive(item.href) && "bg-muted text-primary"
                )}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        <div className="border-t p-2 lg:p-4">
          <button
            type="button"
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
              "text-muted-foreground transition-all hover:text-primary hover:bg-muted"
            )}
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

type NavItem = {
  name: string;
  href: string;
  icon: React.ReactNode;
};