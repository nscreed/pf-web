"use client";

import { useState } from "react";
import {
  Mail,
  Loader2,
  Check,
  Import,
  Search,
  Shield,
  CreditCard,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import apiClient from "@/lib/api-client";
import { formatCurrency } from "@/lib/format-currency";

interface ParsedTransaction {
  amount: number;
  type: "income" | "expense";
  categoryHint: string;
  note: string;
  date: string;
  source: string;
  confidence: number;
  merchant?: string;
  transactionRef?: string;
  counterParty?: string;
  cardEnding?: string;
  balanceAfter?: number;
}

function ConfidenceDot({ value }: { value: number }) {
  const color =
    value >= 90
      ? "bg-green-500"
      : value >= 70
        ? "bg-yellow-500"
        : "bg-orange-500";
  return (
    <span
      className={`inline-block h-2 w-2 rounded-full ${color}`}
      title={`${value}% confidence`}
    />
  );
}

export function EmailScanner() {
  const [scanning, setScanning] = useState(false);
  const [importing, setImporting] = useState(false);
  const [parsed, setParsed] = useState<ParsedTransaction[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [scanned, setScanned] = useState(false);
  const [result, setResult] = useState<{
    imported: number;
    skipped: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleScan() {
    setScanning(true);
    setError(null);
    setResult(null);
    try {
      const { data } = await apiClient.get("/api/email-parser/scan", {
        params: { days: 30 },
      });
      const txns = data.data?.transactions ?? data.transactions ?? [];
      setParsed(txns);
      // Auto-select high confidence (>=70) items
      setSelected(
        new Set(
          txns
            .map((t: ParsedTransaction, i: number) =>
              t.confidence >= 70 ? i : -1,
            )
            .filter((i: number) => i >= 0),
        ),
      );
      setScanned(true);
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        "Failed to scan emails. Try re-logging in.";
      setError(msg);
    } finally {
      setScanning(false);
    }
  }

  async function handleImport() {
    const items = parsed.filter((_, i) => selected.has(i));
    if (items.length === 0) return;

    setImporting(true);
    setError(null);
    try {
      const { data } = await apiClient.post("/api/email-parser/import", {
        transactions: items,
      });
      const res = data.data ?? data;
      setResult({
        imported: res.imported ?? 0,
        skipped: res.skipped ?? 0,
      });
      setParsed([]);
      setSelected(new Set());
    } catch {
      setError("Failed to import. Try again.");
    } finally {
      setImporting(false);
    }
  }

  function toggleItem(index: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === parsed.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(parsed.map((_, i) => i)));
    }
  }

  // ─── Initial state ─────────────────────────────
  if (!scanned) {
    return (
      <div className="flex flex-col items-center gap-8 py-16 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
          <Mail className="h-10 w-10 text-primary" />
        </div>
        <div className="max-w-lg">
          <h3 className="text-xl font-semibold">Smart Email Import</h3>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Automatically find transactions from your Gmail — bKash, Nagad,
            Rocket, bank alerts, credit card charges, subscriptions, and more.
            You review everything before importing.
          </p>
        </div>

        <div className="grid gap-3 text-left max-w-md w-full">
          {[
            {
              icon: Shield,
              text: "Read-only access — we never send or modify emails",
            },
            {
              icon: CreditCard,
              text: "Detects bKash, Nagad, Rocket, 30+ BD banks, credit cards",
            },
            {
              icon: RefreshCw,
              text: "Auto-categorizes: Food, Transport, Bills, Shopping, etc.",
            },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/5">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">{text}</span>
            </div>
          ))}
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button
          onClick={handleScan}
          disabled={scanning}
          size="lg"
          className="cursor-pointer gap-2"
        >
          {scanning ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          {scanning ? "Scanning your emails..." : "Scan Last 30 Days"}
        </Button>
      </div>
    );
  }

  // ─── Nothing found ─────────────────────────────
  if (parsed.length === 0 && !result) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <Mail className="h-12 w-12 text-muted-foreground/30" />
        <div>
          <h3 className="text-lg font-semibold">No transactions found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            No matching emails in the last 30 days.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setScanned(false)}
          className="cursor-pointer"
        >
          Try Again
        </Button>
      </div>
    );
  }

  // ─── Import success ────────────────────────────
  if (result) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">
            {result.imported} transaction
            {result.imported !== 1 ? "s" : ""} imported
          </h3>
          {result.skipped > 0 && (
            <p className="mt-1 text-sm text-muted-foreground">
              {result.skipped} skipped (duplicates or no matching category)
            </p>
          )}
        </div>
        <Button
          variant="outline"
          onClick={() => {
            setScanned(false);
            setResult(null);
          }}
          className="cursor-pointer"
        >
          Scan Again
        </Button>
      </div>
    );
  }

  // ─── Review parsed results ─────────────────────
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-medium">
            Found {parsed.length} transaction
            {parsed.length !== 1 ? "s" : ""}
          </h3>
          <p className="text-xs text-muted-foreground">
            High-confidence items are pre-selected. Review and import.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleAll}
            className="cursor-pointer text-xs"
          >
            {selected.size === parsed.length ? "Deselect All" : "Select All"}
          </Button>
          <Button
            size="sm"
            onClick={handleImport}
            disabled={importing || selected.size === 0}
            className="cursor-pointer gap-1.5"
          >
            {importing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Import className="h-3.5 w-3.5" />
            )}
            Import {selected.size}
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="space-y-2">
        {parsed.map((txn, i) => (
          <Card
            key={`${txn.transactionRef || i}-${txn.date}`}
            className={`cursor-pointer transition-all ${
              selected.has(i)
                ? "border-primary/40 bg-primary/5"
                : "opacity-40"
            }`}
            onClick={() => toggleItem(i)}
          >
            <CardContent className="flex items-start gap-3 p-3">
              {/* Checkbox */}
              <div
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                  selected.has(i)
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border"
                }`}
              >
                {selected.has(i) && <Check className="h-3 w-3" />}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Row 1: Note + Source badge + Confidence */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate">
                    {txn.note}
                  </span>
                  <Badge variant="outline" className="shrink-0 text-[10px]">
                    {txn.source}
                  </Badge>
                  <ConfidenceDot value={txn.confidence} />
                </div>

                {/* Row 2: Meta info */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
                  <span className="text-xs text-muted-foreground">
                    {txn.date}
                  </span>
                  <Badge
                    variant="secondary"
                    className="text-[10px] px-1.5 py-0"
                  >
                    {txn.categoryHint}
                  </Badge>
                  {txn.merchant && txn.merchant !== txn.source && (
                    <span className="text-xs text-muted-foreground">
                      {txn.merchant}
                    </span>
                  )}
                  {txn.cardEnding && (
                    <span className="text-xs text-muted-foreground">
                      Card ****{txn.cardEnding}
                    </span>
                  )}
                  {txn.transactionRef && (
                    <span className="text-xs text-muted-foreground/50 font-mono">
                      {txn.transactionRef}
                    </span>
                  )}
                </div>
              </div>

              {/* Amount */}
              <div className="text-right shrink-0">
                <span
                  className={`text-sm font-semibold ${
                    txn.type === "income"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {txn.type === "income" ? "+" : "-"}
                  {formatCurrency(txn.amount)}
                </span>
                {txn.balanceAfter !== undefined && (
                  <div className="text-[10px] text-muted-foreground/50">
                    Bal: {formatCurrency(txn.balanceAfter)}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
