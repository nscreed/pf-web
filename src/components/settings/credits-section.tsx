"use client";

import { useState } from "react";
import { Coins, Sparkles, Loader2, Gift, Smartphone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import apiClient from "@/lib/api-client";
import { useAuth } from "@/providers/auth-provider";

export function CreditsSection() {
  const { user, refreshUser } = useAuth();
  const [claiming, setClaiming] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  async function handleClaim() {
    setClaiming(true);
    setMessage(null);
    try {
      const { data } = await apiClient.post("/api/profile/credits/claim");
      const res = data.data ?? data;
      setMessage({
        type: "success",
        text: `+${res.claimed} credits claimed! New balance: ${res.credits}`,
      });
      refreshUser();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.data?.message ||
        "Failed to claim credits";
      setMessage({ type: "error", text: msg });
    } finally {
      setClaiming(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <CardTitle>Credits</CardTitle>
          </div>
          {user?.credits !== undefined && (
            <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1">
              <Coins className="h-3.5 w-3.5 text-primary" />
              <span className="text-sm font-semibold text-primary">
                {user.credits}
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Credits are used for AI features like spending insights and email
          scanning. You receive 100 credits on signup and 20 free credits every
          month.
        </p>

        {message && (
          <p
            className={`text-sm rounded-md px-3 py-2 ${
              message.type === "success"
                ? "text-green-700 bg-green-50 dark:text-green-400 dark:bg-green-900/20"
                : "text-destructive bg-destructive/10"
            }`}
          >
            {message.text}
          </p>
        )}

        {/* Daily free claim */}
        <div className="flex items-center justify-between rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
              <Gift className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-medium">Daily Free Credits</p>
              <p className="text-xs text-muted-foreground">
                Claim 10 free credits once per day
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={handleClaim}
            disabled={claiming}
            className="cursor-pointer gap-1.5"
          >
            {claiming ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Gift className="h-3.5 w-3.5" />
            )}
            Claim
          </Button>
        </div>

        {/* Mobile app upsell */}
        <div className="flex items-center gap-3 rounded-xl border border-dashed p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
            <Smartphone className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">Want more credits?</p>
            <p className="text-xs text-muted-foreground">
              Purchase credit packs from our mobile app (coming soon)
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
