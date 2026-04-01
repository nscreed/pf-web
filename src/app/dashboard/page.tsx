"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/providers/auth-provider";
import { ProtectedRoute } from "@/components/layout/protected-route";

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <ProtectedRoute>
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="border-b bg-card/80 backdrop-blur-sm">
          <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-bold text-xs text-primary-foreground">
                PF
              </div>
              <span className="text-base font-semibold tracking-tight">
                Personal Finance
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.picture} alt={user?.name} />
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                    {user?.name?.[0]?.toUpperCase() ||
                      user?.email?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden text-sm font-medium sm:inline">
                  {user?.name || user?.email}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="cursor-pointer"
              >
                Logout
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight">
              Welcome back
              {user?.name ? `, ${user.name.split(" ")[0]}` : ""}!
            </h2>
            <p className="mt-1 text-muted-foreground">
              Here&apos;s your dashboard overview.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
                  <span className="text-lg font-semibold">Active</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Account
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold truncate">{user?.email}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Currency
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold">
                  {user?.defaultCurrency || "BDT"}
                </p>
              </CardContent>
            </Card>
          </div>

          <Separator className="my-8" />

          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user?.picture} alt={user?.name} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xl font-medium">
                    {user?.name?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-lg font-semibold">
                    {user?.name || "User"}
                  </p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  );
}
