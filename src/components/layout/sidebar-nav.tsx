"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Receipt,
  Plus,
  RefreshCw,
  Settings,
  LogOut,
  Sparkles,
  Shield,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { useAuth } from "@/providers/auth-provider";

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/transactions", label: "Transactions", icon: Receipt },
  { href: "/transactions/new", label: "Add Transaction", icon: Plus },
  { href: "/recurring", label: "Recurring", icon: RefreshCw },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <Sidebar>
      {/* Logo */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/dashboard" />}>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-bold text-xs text-primary-foreground">
                PF
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-semibold">Personal Finance</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Main nav */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    tooltip={item.label}
                    render={<Link href={item.href} />}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin */}
        {user?.role === "admin" && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Admin</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={pathname === "/admin"}
                      tooltip="Admin Panel"
                      render={<Link href="/admin" />}
                    >
                      <Shield />
                      <span>Admin Panel</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      <SidebarFooter>
        {/* Credits */}
        {user?.credits !== undefined && (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip={`${user.credits} credits`}
                render={<Link href="/settings" />}
              >
                <Sparkles />
                <span>{user.credits} credits</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )}

        <SidebarSeparator />

        {/* User */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user?.picture} alt={user?.name} />
                <AvatarFallback className="rounded-lg bg-primary/10 text-primary text-sm font-medium">
                  {user?.name?.[0]?.toUpperCase() ||
                    user?.email?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {user?.name || "User"}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {user?.email}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={logout}
              className="cursor-pointer"
              tooltip="Logout"
            >
              <LogOut />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
