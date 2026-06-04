"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, PlusCircle, List, BarChart3, LogOut, QrCode } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useLogout } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/create", label: "Create Code", icon: PlusCircle },
  { href: "/manage", label: "Manage Codes", icon: List },
  { href: "/dashboard", label: "Analytics", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout: clearAuth } = useAuth();
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        clearAuth();
        router.push("/login");
      },
      onError: () => {
        clearAuth();
        router.push("/login");
      },
    });
  };

  return (
    <div className="flex flex-col w-64 bg-sidebar text-sidebar-foreground h-[100dvh] border-r border-sidebar-border shrink-0">
      <div className="p-6 flex items-center gap-3 border-b border-sidebar-border/50">
        <div className="bg-primary text-primary-foreground p-2 rounded-md">
          <QrCode className="w-6 h-6" />
        </div>
        <h1 className="font-bold text-xl tracking-tight">QR Link</h1>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item, i) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={i}
              href={item.href}
              data-testid={`nav-${item.label.toLowerCase().replace(/ /g, "-")}`}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors font-medium text-sm",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-sidebar-border/50">
        <button
          onClick={handleLogout}
          data-testid="button-logout"
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-md text-sidebar-foreground/80 hover:bg-destructive hover:text-destructive-foreground transition-colors font-medium text-sm"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );
}
