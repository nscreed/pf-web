"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  LogOut,
  Trash2,
  Loader2,
  AlertTriangle,
  User,
  Palette,
  Tag,
  Download,
  Sparkles,
  Shield,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { ProfileSection } from "@/components/settings/profile-section";
import { ThemeSection } from "@/components/settings/theme-section";
import { CategoriesSection } from "@/components/settings/categories-section";
import { ExportSection } from "@/components/settings/export-section";
import { CreditsSection } from "@/components/settings/credits-section";
import { useAuth } from "@/providers/auth-provider";
import apiClient from "@/lib/api-client";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [erasing, setErasing] = useState(false);
  const [eraseResult, setEraseResult] = useState<{
    transactions: number;
    recurringRules: number;
    categories: number;
    scannedEmails: number;
  } | null>(null);
  const [eraseError, setEraseError] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);

  async function handleEraseData() {
    setErasing(true);
    setEraseError(false);
    try {
      const { data } = await apiClient.delete("/api/profile/erase-data");
      const res = data.data ?? data;
      setEraseResult(res);
      setConfirmOpen(false);
      setResultOpen(true);
    } catch {
      setEraseError(true);
    } finally {
      setErasing(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Settings"
        subtitle="Manage your account and preferences."
      />

      <div className="px-4 pb-8 lg:px-8">
        {/* ── User card at top ── */}
        <Card className="mb-6">
          <CardContent className="flex items-center justify-between p-5">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14">
                <AvatarImage src={user?.picture} alt={user?.name} />
                <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                  {user?.name?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-lg font-semibold">{user?.name || "User"}</h2>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Sparkles className="h-3 w-3 text-primary" />
                    {user?.credits ?? 0} credits
                  </span>
                  {user?.role === "admin" && (
                    <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                      <Shield className="h-2.5 w-2.5" />
                      Admin
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="cursor-pointer gap-2 text-muted-foreground hover:text-destructive hover:border-destructive/30"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </CardContent>
        </Card>

        {/* ── Tabbed sections ── */}
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList>
            <TabsTrigger value="general" className="cursor-pointer gap-1.5">
              <User className="h-3.5 w-3.5" />
              General
            </TabsTrigger>
            <TabsTrigger value="categories" className="cursor-pointer gap-1.5">
              <Tag className="h-3.5 w-3.5" />
              Categories
            </TabsTrigger>
            <TabsTrigger value="credits" className="cursor-pointer gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              Credits
            </TabsTrigger>
            <TabsTrigger value="data" className="cursor-pointer gap-1.5">
              <Download className="h-3.5 w-3.5" />
              Data
            </TabsTrigger>
          </TabsList>

          {/* ── General ── */}
          <TabsContent value="general" className="space-y-6">
            <ProfileSection />
            <ThemeSection />
          </TabsContent>

          {/* ── Categories ── */}
          <TabsContent value="categories">
            <CategoriesSection />
          </TabsContent>

          {/* ── Credits ── */}
          <TabsContent value="credits">
            <CreditsSection />
          </TabsContent>

          {/* ── Data ── */}
          <TabsContent value="data" className="space-y-6">
            <ExportSection />

            {/* Danger Zone */}
            <Card className="border-destructive/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  Danger Zone
                </CardTitle>
                <CardDescription>
                  Irreversible actions that affect all your data.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between rounded-lg border border-destructive/20 p-4">
                  <div>
                    <p className="text-sm font-medium">Erase all data</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Delete all transactions, recurring rules, custom
                      categories, and scan history.
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setConfirmOpen(true)}
                    className="cursor-pointer gap-2 shrink-0 ml-4"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Erase All
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* ── Confirmation dialog ── */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 mb-2">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <DialogTitle className="text-center">
              Erase all data?
            </DialogTitle>
            <DialogDescription className="text-center">
              This will permanently delete all your transactions, recurring
              rules, custom categories, and email scan history. This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {eraseError && (
            <p className="text-sm text-destructive text-center">
              Something went wrong. Please try again.
            </p>
          )}
          <DialogFooter>
            <DialogClose
              render={<Button variant="outline" className="cursor-pointer" />}
            >
              Cancel
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleEraseData}
              disabled={erasing}
              className="cursor-pointer gap-2"
            >
              {erasing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Yes, erase everything
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Result dialog ── */}
      <Dialog open={resultOpen} onOpenChange={setResultOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 mb-2">
              <Trash2 className="h-6 w-6 text-green-600" />
            </div>
            <DialogTitle className="text-center">Data erased</DialogTitle>
            <DialogDescription className="text-center">
              Your data has been permanently removed.
            </DialogDescription>
          </DialogHeader>
          {eraseResult && (
            <div className="grid grid-cols-2 gap-3 text-center">
              {[
                { label: "Transactions", value: eraseResult.transactions },
                { label: "Recurring rules", value: eraseResult.recurringRules },
                { label: "Categories", value: eraseResult.categories },
                { label: "Scan records", value: eraseResult.scannedEmails },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-lg bg-muted px-3 py-2">
                  <p className="text-lg font-semibold tabular-nums">{value}</p>
                  <p className="text-[11px] text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
          )}
          <DialogFooter>
            <DialogClose
              render={<Button className="cursor-pointer w-full sm:w-auto" />}
            >
              Done
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
