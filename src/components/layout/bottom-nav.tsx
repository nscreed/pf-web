"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Receipt, Plus, RefreshCw, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/transactions", label: "Transactions", icon: Receipt },
  { href: "/transactions/new", label: "Add", icon: Plus, isCenter: true },
  { href: "/recurring", label: "Recurring", icon: RefreshCw },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function BottomNav({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 border-t bg-background",
        className
      )}
    >
      <div className="flex h-[60px] items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          if (item.isCenter) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg -translate-y-2"
              >
                <item.icon className="h-6 w-6" />
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 text-xs",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
