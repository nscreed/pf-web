"use client";

import { useState } from "react";
import { Mail, Loader2, Check, X, Import, Search } from "lucide-react";
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
}

export function EmailScanner() {
  const [scanning, setScanning] = useState(false);
  const [importing, setImporting] = useState(false);
  const [parsed, setParsed] = useState<ParsedTransaction[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [scanned, setScanned] = useState(false);
  const [importedCount, setImportedCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleScan() {
    setScanning(true);
    setError(null);
    setImportedCount(null);
    try {
      const { data } = await apiClient.get("/api/email-parser/scan", {
        params: { days: 30 },
      });
      const txns = data.data?.transactions ?? data.transactions ?? [];
      setParsed(txns);
      setSelected(new Set(txns.map((_: unknown, i: number) => i)));
      setScanned(true);
    } catch (err: any) {
      const msg =
        err.response?.data?.message || "Failed to scan emails. Try re-logging in.";
      setError(msg);
    } finally {
      setScanning(false);
    }
  }

  async function handleImport() {
    const items = parsed.filter((_, i) => selected.has(i));
    if (items.length === 0) return;

    setImporting(true);
    try {
      const { data } = await apiClient.post("/api/email-parser/import", {
        transactions: items,
      });
      const count = data.data?.imported ?? data.imported ?? 0;
      setImportedCount(count);
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

  // Initial state — not scanned yet
  if (!scanned) {
    return (
      <div className="flex flex-col items-center gap-6 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Mail className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Smart Email Import</h3>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            Scan your Gmail for bKash, Nagad, bank alerts, and subscription
            emails. We&apos;ll find transactions and let you review before
            importing.
          </p>
        </div>
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
        <Button
          onClick={handleScan}
          disabled={scanning}
          className="cursor-pointer gap-2"
        >
          {scanning ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          {scanning ? "Scanning emails..." : "Scan Last 30 Days"}
        </Button>
      </div>
    );
  }

  // Scanned but nothing found
  if (parsed.length === 0 && importedCount === null) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <Mail className="h-12 w-12 text-muted-foreground/40" />
        <div>
          <h3 className="text-lg font-semibold">No transactions found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            We couldn&apos;t find any transaction emails in the last 30 days.
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

  // Import success
  if (importedCount !== null) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">
            {importedCount} transaction{importedCount !== 1 ? "s" : ""} imported
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            They&apos;re now in your transaction list.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setScanned(false);
              setImportedCount(null);
            }}
            className="cursor-pointer"
          >
            Scan Again
          </Button>
        </div>
      </div>
    );
  }

  // Show parsed results for review
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">
            Found {parsed.length} transaction{parsed.length !== 1 ? "s" : ""}
          </h3>
          <p className="text-xs text-muted-foreground">
            Select which ones to import. Duplicates are auto-skipped.
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
            key={i}
            className={`cursor-pointer transition-colors ${
              selected.has(i)
                ? "border-primary/40 bg-primary/5"
                : "opacity-50"
            }`}
            onClick={() => toggleItem(i)}
          >
            <CardContent className="flex items-center gap-3 p-3">
              <div
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                  selected.has(i)
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border"
                }`}
              >
                {selected.has(i) && <Check className="h-3 w-3" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate">
                    {txn.note}
                  </span>
                  <Badge variant="outline" className="shrink-0 text-[10px]">
                    {txn.source}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-muted-foreground">
                    {txn.date}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {txn.categoryHint}
                  </span>
                </div>
              </div>

              <span
                className={`text-sm font-semibold whitespace-nowrap ${
                  txn.type === "income"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {txn.type === "income" ? "+" : "-"}
                {formatCurrency(txn.amount)}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
