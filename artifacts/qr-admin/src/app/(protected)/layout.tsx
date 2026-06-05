"use client";

import { useAuth } from "@/contexts/auth-context";
import { Sidebar } from "@/components/layout/sidebar";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner size="lg" className="text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-[100dvh] w-full bg-background overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col h-[100dvh] overflow-y-auto overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
