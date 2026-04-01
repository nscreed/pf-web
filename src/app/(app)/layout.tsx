"use client";

import { ProtectedRoute } from "@/components/layout/protected-route";
import { AppSidebar } from "@/components/layout/sidebar-nav";
import { BottomNav } from "@/components/layout/bottom-nav";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      {/* Desktop: shadcn sidebar */}
      <SidebarProvider className="hidden lg:flex">
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-12 items-center border-b px-4">
            <SidebarTrigger className="-ml-1" />
          </header>
          <div className="flex-1">{children}</div>
        </SidebarInset>
      </SidebarProvider>

      {/* Mobile: bottom nav */}
      <div className="lg:hidden">
        <main className="pb-20">{children}</main>
        <BottomNav />
      </div>
    </ProtectedRoute>
  );
}
