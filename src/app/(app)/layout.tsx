"use client";

import { ProtectedRoute } from "@/components/layout/protected-route";
import { AppSidebar } from "@/components/layout/sidebar-nav";
import { BottomNav } from "@/components/layout/bottom-nav";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      {/* Desktop */}
      <SidebarProvider className="hidden lg:flex">
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-10 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1.5 size-7" />
            <Separator orientation="vertical" className="mr-2 h-4" />
          </header>
          <main className="flex-1">{children}</main>
        </SidebarInset>
      </SidebarProvider>

      {/* Mobile */}
      <div className="lg:hidden">
        <main className="pb-20">{children}</main>
        <BottomNav />
      </div>
    </ProtectedRoute>
  );
}
