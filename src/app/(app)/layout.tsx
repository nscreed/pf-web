"use client";

import { ProtectedRoute } from "@/components/layout/protected-route";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { BottomNav } from "@/components/layout/bottom-nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen">
        <SidebarNav className="hidden lg:flex" />
        <main className="flex-1 pb-20 lg:pb-0">{children}</main>
        <BottomNav className="lg:hidden" />
      </div>
    </ProtectedRoute>
  );
}
