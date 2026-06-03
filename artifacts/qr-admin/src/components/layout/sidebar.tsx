import { Link, useLocation } from "wouter";
import { LayoutDashboard, PlusCircle, List, BarChart3, LogOut, QrCode } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useLogout } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const [location] = useLocation();
  const { logout: clearAuth } = useAuth();
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        clearAuth();
      },
      onError: () => {
        clearAuth();
      }
    });
  };

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/create", label: "Create Code", icon: PlusCircle },
    { href: "/manage", label: "Manage Codes", icon: List },
    { href: "/dashboard", label: "Analytics", icon: BarChart3 },
  ];

  return (
    <div className="flex flex-col w-64 bg-sidebar text-sidebar-foreground h-[100dvh] border-r border-sidebar-border shrink-0 transition-all">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-primary text-primary-foreground p-2 rounded-md">
          <QrCode className="w-6 h-6" />
        </div>
        <h1 className="font-bold text-xl tracking-tight">QR Link</h1>
      </div>

      <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item, i) => (
          <Link
            key={i}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors font-medium text-sm",
              location === item.href || (item.href !== "/dashboard" && location.startsWith(item.href))
                ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            )}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-4 mt-auto border-t border-sidebar-border/50">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-md text-sidebar-foreground/80 hover:bg-destructive hover:text-destructive-foreground transition-colors font-medium text-sm"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );
}
