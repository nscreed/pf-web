"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { LogOut, Trash2, Loader2, AlertTriangle } from "lucide-react";
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
        <CreditsSection />

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

        {/* Danger Zone */}
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Permanently delete all your transactions, recurring rules, custom
              categories, and email scan history. Your account and system
              categories will be kept.
            </p>
            <Button
              variant="destructive"
              onClick={() => setConfirmOpen(true)}
              className="cursor-pointer gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Erase All My Data
            </Button>
          </CardContent>
        </Card>
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
                <div
                  key={label}
                  className="rounded-lg bg-muted px-3 py-2"
                >
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
