"use client";

import { useState } from "react";
import {
  Coins,
  Sparkles,
  Loader2,
  Gift,
  Smartphone,
  Play,
  MessageSquare,
  Send,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import apiClient from "@/lib/api-client";
import { useAuth } from "@/providers/auth-provider";

export function CreditsSection() {
  const { user, refreshUser } = useAuth();
  const [claiming, setClaiming] = useState(false);
  const [watchingAd, setWatchingAd] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [requestReason, setRequestReason] = useState("");
  const [showRequestForm, setShowRequestForm] = useState(false);
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
        text: `+${res.claimed} credits claimed! Balance: ${res.credits}`,
      });
      refreshUser();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.data?.message ||
        "Failed to claim";
      setMessage({ type: "error", text: msg });
    } finally {
      setClaiming(false);
    }
  }

  async function handleWatchAd() {
    setWatchingAd(true);
    setMessage(null);

    // Simulate ad watch (2s delay) — real SDK will replace this
    await new Promise((r) => setTimeout(r, 2000));

    try {
      const { data } = await apiClient.post("/api/profile/credits/ad-reward");
      const res = data.data ?? data;
      setMessage({
        type: "success",
        text: `+${res.claimed} credits! ${res.adsRemaining} ads remaining today`,
      });
      refreshUser();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.data?.message ||
        "Failed to claim reward";
      setMessage({ type: "error", text: msg });
    } finally {
      setWatchingAd(false);
    }
  }

  async function handleRequest() {
    if (!requestReason.trim()) return;
    setRequesting(true);
    setMessage(null);
    try {
      const { data } = await apiClient.post("/api/profile/credits/request", {
        reason: requestReason.trim(),
      });
      const res = data.data ?? data;
      setMessage({ type: "success", text: res.message });
      setRequestReason("");
      setShowRequestForm(false);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.data?.message ||
        "Failed to submit request";
      setMessage({ type: "error", text: msg });
    } finally {
      setRequesting(false);
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
          Credits are used for AI features. You get 100 on signup and 20 free
          every month.
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

        <div className="space-y-3">
          {/* Daily free claim */}
          <div className="flex items-center justify-between rounded-xl border p-3.5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <Gift className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Daily Bonus</p>
                <p className="text-[11px] text-muted-foreground">
                  10 credits, once per day
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
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

          {/* Watch ad */}
          <div className="flex items-center justify-between rounded-xl border p-3.5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Play className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Watch Ad</p>
                <p className="text-[11px] text-muted-foreground">
                  3 credits per ad, max 5/day
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleWatchAd}
              disabled={watchingAd}
              className="cursor-pointer gap-1.5"
            >
              {watchingAd ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Watching...
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5" />
                  Watch
                </>
              )}
            </Button>
          </div>

          {/* Request credits */}
          <div className="rounded-xl border p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                  <MessageSquare className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Request Credits</p>
                  <p className="text-[11px] text-muted-foreground">
                    Ask admin for free credits
                  </p>
                </div>
              </div>
              {!showRequestForm && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowRequestForm(true)}
                  className="cursor-pointer gap-1.5"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  Ask
                </Button>
              )}
            </div>
            {showRequestForm && (
              <div className="flex gap-2">
                <Input
                  placeholder="Why do you need credits?"
                  value={requestReason}
                  onChange={(e) => setRequestReason(e.target.value)}
                  className="text-sm"
                  onKeyDown={(e) => e.key === "Enter" && handleRequest()}
                />
                <Button
                  size="sm"
                  onClick={handleRequest}
                  disabled={requesting || !requestReason.trim()}
                  className="cursor-pointer shrink-0"
                >
                  {requesting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Mobile app */}
          <div className="flex items-center gap-3 rounded-xl border border-dashed p-3.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
              <Smartphone className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">
                Install App → 50 free credits
              </p>
              <p className="text-[11px] text-muted-foreground">
                Download our mobile app for bonus credits + in-app purchases
                (coming soon)
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
