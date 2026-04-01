"use client";

import { useEffect, useState } from "react";
import { Coins, Sparkles, Loader2, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import apiClient from "@/lib/api-client";
import { useAuth } from "@/providers/auth-provider";

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  currency: string;
}

export function CreditsSection() {
  const { user, refreshUser } = useAuth();
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [buying, setBuying] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .get("/api/payments/packages")
      .then(({ data }) => setPackages(data.data ?? data ?? []))
      .catch(() => {});
  }, []);

  async function handleBuy(packageId: string) {
    setBuying(packageId);
    setError(null);
    setSuccess(null);

    try {
      const callbackURL = `${window.location.origin}/settings?payment=callback`;

      const { data } = await apiClient.post("/api/payments/create", {
        packageId,
        callbackURL,
      });
      const res = data.data ?? data;

      if (res.bkashURL) {
        // Redirect to bKash checkout
        window.location.href = res.bkashURL;
      } else {
        setError("Could not initiate payment. Please try again.");
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.data?.message ||
        "Payment failed";
      setError(msg);
    } finally {
      setBuying(null);
    }
  }

  // Handle bKash callback redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get("status");
    const paymentID = params.get("paymentID");

    if (paymentStatus === "success" && paymentID) {
      // Execute the payment
      apiClient
        .post("/api/payments/execute", { paymentId: paymentID })
        .then(({ data }) => {
          const res = data.data ?? data;
          if (res.status === "completed") {
            setSuccess(
              `Payment successful! ${res.credits} credits added. New balance: ${res.newBalance}`,
            );
            refreshUser();
          } else {
            setError(res.message || "Payment could not be completed.");
          }
        })
        .catch(() => setError("Failed to verify payment."));

      // Clean URL
      window.history.replaceState({}, "", "/settings");
    } else if (paymentStatus === "failure" || paymentStatus === "cancel") {
      setError("Payment was cancelled or failed.");
      window.history.replaceState({}, "", "/settings");
    }
  }, [refreshUser]);

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

        {error && (
          <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
            {error}
          </p>
        )}
        {success && (
          <p className="text-sm text-green-700 bg-green-50 dark:text-green-400 dark:bg-green-900/20 rounded-md px-3 py-2">
            {success}
          </p>
        )}

        {/* Credit packages */}
        <div className="grid gap-3 sm:grid-cols-3">
          {packages.map((pkg) => {
            const isPopular = pkg.id === "popular";
            return (
              <div
                key={pkg.id}
                className={`relative rounded-xl border p-4 text-center space-y-2 ${
                  isPopular
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                    : ""
                }`}
              >
                {isPopular && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                    Most Popular
                  </span>
                )}
                <p className="text-2xl font-bold">{pkg.credits}</p>
                <p className="text-xs text-muted-foreground">credits</p>
                <Button
                  size="sm"
                  variant={isPopular ? "default" : "outline"}
                  onClick={() => handleBuy(pkg.id)}
                  disabled={buying !== null}
                  className="cursor-pointer w-full gap-1.5"
                >
                  {buying === pkg.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <>
                      ৳{pkg.price}
                      <ExternalLink className="h-3 w-3" />
                    </>
                  )}
                </Button>
              </div>
            );
          })}
        </div>

        <p className="text-[11px] text-muted-foreground text-center">
          Payments processed securely via bKash
        </p>
      </CardContent>
    </Card>
  );
}
