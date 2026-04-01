"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { ProfileSection } from "@/components/settings/profile-section";
import { ThemeSection } from "@/components/settings/theme-section";
import { CategoriesSection } from "@/components/settings/categories-section";
import { ExportSection } from "@/components/settings/export-section";
import { useAuth } from "@/providers/auth-provider";

export default function SettingsPage() {
  const { user, logout } = useAuth();

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Settings"
        subtitle="Manage your account and preferences."
      />

      <div className="space-y-6 px-4 pb-8 lg:px-8">
        <ProfileSection />
        <ThemeSection />
        <CategoriesSection />
        <ExportSection />

        {/* Account */}
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.picture} alt={user?.name} />
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  {user?.name?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{user?.name || "User"}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={logout}
              className="cursor-pointer text-destructive hover:bg-destructive/10"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
