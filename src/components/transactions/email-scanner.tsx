"use client";

import { useRef, useState } from "react";
import {
  Mail,
  Loader2,
  Check,
  Import,
  Search,
  Shield,
  CreditCard,
  Brain,
  Square,
  Undo2,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import apiClient from "@/lib/api-client";
import { formatCurrency } from "@/lib/format-currency";

// ═══════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════

interface ParsedTransaction {
  amount: number;
  type: "income" | "expense";
  currency?: string;
  categoryHint: string;
  categoryIcon?: string;
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

interface StreamedTransaction extends ParsedTransaction {
  status: "auto-imported" | "needs-review";
  dbId?: string;
}

type ScanPeriod = "this-month" | "last-month" | "last-3-months" | "last-6-months";

const SCAN_PERIODS: { value: ScanPeriod; label: string }[] = [
  { value: "this-month", label: "This Month" },
  { value: "last-month", label: "Last Month" },
  { value: "last-3-months", label: "Last 3 Months" },
  { value: "last-6-months", label: "Last 6 Months" },
];

function getDateRange(period: ScanPeriod): {
  dateFrom: string;
  dateTo: string;
  label: string;
} {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth(); // 0-indexed

  const fmt = (d: Date) => d.toISOString().split("T")[0];
  const monthStart = (year: number, month: number) =>
    new Date(year, month, 1);
  const monthEnd = (year: number, month: number) =>
    new Date(year, month + 1, 0); // last day of month

  switch (period) {
    case "this-month":
      return {
        dateFrom: fmt(monthStart(y, m)),
        dateTo: fmt(now),
        label: now.toLocaleString("default", { month: "long", year: "numeric" }),
      };
    case "last-month": {
      const start = monthStart(y, m - 1);
      const end = monthEnd(y, m - 1);
      return {
        dateFrom: fmt(start),
        dateTo: fmt(end),
        label: start.toLocaleString("default", {
          month: "long",
          year: "numeric",
        }),
      };
    }
    case "last-3-months": {
      const start = monthStart(y, m - 2);
      return {
        dateFrom: fmt(start),
        dateTo: fmt(now),
        label: `${start.toLocaleString("default", { month: "short" })} – ${now.toLocaleString("default", { month: "short", year: "numeric" })}`,
      };
    }
    case "last-6-months": {
      const start = monthStart(y, m - 5);
      return {
        dateFrom: fmt(start),
        dateTo: fmt(now),
        label: `${start.toLocaleString("default", { month: "short" })} – ${now.toLocaleString("default", { month: "short", year: "numeric" })}`,
      };
    }
  }
}

// ═══════════════════════════════════════════════════════
// Confidence indicator
// ═══════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════
// Progress Bar
// ═══════════════════════════════════════════════════════

function ProgressBar({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  return (
    <div className="w-full">
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// Transaction Row (live streaming item)
// ═══════════════════════════════════════════════════════

function TransactionRow({
  txn,
  isNew,
}: {
  txn: StreamedTransaction;
  isNew: boolean;
}) {
  const isAuto = txn.status === "auto-imported";
  return (
    <div
      className={`flex items-center gap-3 px-3 py-2.5 transition-all duration-500 ${
        isNew ? "animate-in slide-in-from-bottom-2 fade-in" : ""
      }`}
    >
      {/* Status icon */}
      <div
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
          isAuto
            ? "bg-green-100 text-green-600 dark:bg-green-900/40"
            : "bg-amber-100 text-amber-600 dark:bg-amber-900/40"
        }`}
      >
        {isAuto ? (
          <CheckCircle2 className="h-3.5 w-3.5" />
        ) : (
          <AlertTriangle className="h-3.5 w-3.5" />
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate">{txn.note}</span>
          <ConfidenceDot value={txn.confidence} />
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[11px] text-muted-foreground">{txn.date}</span>
          <span className="text-muted-foreground/30">·</span>
          <span className="text-[11px] text-muted-foreground">
            {txn.categoryIcon && `${txn.categoryIcon} `}{txn.categoryHint}
          </span>
          {txn.source && (
            <>
              <span className="text-muted-foreground/30">·</span>
              <span className="text-[11px] text-muted-foreground">{txn.source}</span>
            </>
          )}
        </div>
      </div>

      {/* Amount */}
      <div className="text-right shrink-0">
        <span
          className={`text-sm font-semibold tabular-nums ${
            txn.type === "income" ? "text-green-600" : "text-foreground"
          }`}
        >
          {txn.type === "income" ? "+" : "-"}
          {formatCurrency(txn.amount)}
        </span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════

export function EmailScanner({
  onTransactionsChanged,
}: {
  onTransactionsChanged?: () => void;
}) {
  const [phase, setPhase] = useState<
    "idle" | "scanning" | "complete" | "imported"
  >("idle");
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] =
    useState<ScanPeriod>("this-month");
  const [scanLabel, setScanLabel] = useState("");

  // Live streaming state
  const [liveTransactions, setLiveTransactions] = useState<
    StreamedTransaction[]
  >([]);
  const [lastAddedIndex, setLastAddedIndex] = useState(-1);

  // Progress
  const [totalEmails, setTotalEmails] = useState(0);
  const [currentBatch, setCurrentBatch] = useState(0);
  const [totalBatches, setTotalBatches] = useState(0);
  const [autoImportedCount, setAutoImportedCount] = useState(0);
  const [needsReviewCount, setNeedsReviewCount] = useState(0);

  // Completion state
  const [scanBatchId, setScanBatchId] = useState<string | null>(null);
  const [reviewQueue, setReviewQueue] = useState<ParsedTransaction[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [importing, setImporting] = useState(false);
  const [undoing, setUndoing] = useState(false);
  const [undoResult, setUndoResult] = useState<number | null>(null);
  const [importResult, setImportResult] = useState<{
    imported: number;
    skipped: number;
  } | null>(null);
  const [wasCancelled, setWasCancelled] = useState(false);

  // Cancellation
  const abortRef = useRef<AbortController | null>(null);
  const listEndRef = useRef<HTMLDivElement>(null);

  async function handleScan() {
    setPhase("scanning");
    setError(null);
    setLiveTransactions([]);
    setLastAddedIndex(-1);
    setTotalEmails(0);
    setCurrentBatch(0);
    setTotalBatches(0);
    setAutoImportedCount(0);
    setNeedsReviewCount(0);
    setScanBatchId(null);
    setReviewQueue([]);
    setSelected(new Set());
    setImportResult(null);
    setWasCancelled(false);
    setUndoResult(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3031";
    const range = getDateRange(selectedPeriod);
    setScanLabel(range.label);

    abortRef.current = new AbortController();

    try {
      const { getAccessToken } = await import("@/lib/api-client");
      const token = getAccessToken();

      const response = await fetch(
        `${API_URL}/api/email-parser/scan?dateFrom=${range.dateFrom}&dateTo=${range.dateTo}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          signal: abortRef.current.signal,
        },
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.message || `HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      if (!reader) throw new Error("No response stream");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const blocks = buffer.split("\n\n");
        buffer = blocks.pop() || "";

        for (const block of blocks) {
          const eventMatch = block.match(/event:\s*(.+)/);
          const dataMatch = block.match(/data:\s*(.+)/);
          if (!eventMatch || !dataMatch) continue;

          const event = eventMatch[1].trim();
          let data: any;
          try {
            data = JSON.parse(dataMatch[1]);
          } catch {
            continue;
          }

          handleSSEEvent(event, data);
        }
      }

      // Stream ended — if we didn't get a scan-complete, handle gracefully
      if (phase === "scanning") {
        setPhase("complete");
      }
    } catch (err: any) {
      if (err.name === "AbortError") {
        // User cancelled
        setWasCancelled(true);
        setPhase("complete");
        return;
      }
      setError(err.message || "Failed to scan emails. Try re-logging in.");
      setPhase("idle");
    }
  }

  function handleSSEEvent(event: string, data: any) {
    switch (event) {
      case "scan-start":
        setTotalEmails(data.totalEmails || 0);
        break;

      case "batch-start":
        setCurrentBatch(data.batch || 0);
        setTotalBatches(data.totalBatches || 0);
        break;

      case "transaction": {
        const txn: StreamedTransaction = data;
        setLiveTransactions((prev) => {
          const next = [...prev, txn];
          setLastAddedIndex(next.length - 1);
          return next;
        });
        if (txn.status === "auto-imported") {
          setAutoImportedCount((c) => c + 1);
        } else {
          setNeedsReviewCount((c) => c + 1);
        }
        // Auto-scroll to bottom
        setTimeout(() => {
          listEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 50);
        break;
      }

      case "batch-done":
        setCurrentBatch(data.batch || 0);
        break;

      case "scan-complete":
        setScanBatchId(data.scanBatchId || null);
        setReviewQueue(data.reviewQueue || []);
        setAutoImportedCount(data.totalAutoImported || 0);
        setNeedsReviewCount(data.totalNeedsReview || 0);
        // Pre-select all review items
        setSelected(
          new Set(
            (data.reviewQueue || []).map((_: unknown, i: number) => i),
          ),
        );
        setPhase("complete");
        if (data.totalAutoImported > 0) onTransactionsChanged?.();
        break;

      case "error":
        setError(data.message || "Scan failed");
        setPhase("idle");
        break;
    }
  }

  function handleStop() {
    abortRef.current?.abort();
  }

  async function handleImportReview() {
    const items = reviewQueue.filter((_, i) => selected.has(i));
    if (items.length === 0) return;

    setImporting(true);
    setError(null);
    try {
      const { data } = await apiClient.post("/api/email-parser/import", {
        transactions: items,
      });
      const res = data.data ?? data;
      setImportResult({
        imported: res.imported ?? 0,
        skipped: res.skipped ?? 0,
      });
      setReviewQueue([]);
      setSelected(new Set());
      setPhase("imported");
      if ((res.imported ?? 0) > 0) onTransactionsChanged?.();
    } catch {
      setError("Failed to import. Try again.");
    } finally {
      setImporting(false);
    }
  }

  async function handleUndo() {
    if (!scanBatchId) return;
    setUndoing(true);
    try {
      const { data } = await apiClient.post(
        "/api/email-parser/undo-auto-import",
        { scanBatchId },
      );
      const res = data.data ?? data;
      setAutoImportedCount(0);
      setError(null);
      setUndoResult(res.undone || 0);
      if ((res.undone || 0) > 0) onTransactionsChanged?.();
    } catch {
      setError("Failed to undo. Try again.");
    } finally {
      setUndoing(false);
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
    if (selected.size === reviewQueue.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(reviewQueue.map((_, i) => i)));
    }
  }

  function resetToIdle() {
    setPhase("idle");
    setLiveTransactions([]);
    setReviewQueue([]);
    setSelected(new Set());
    setImportResult(null);
    setScanBatchId(null);
    setError(null);
    setWasCancelled(false);
  }

  // ─── Initial state ─────────────────────────────
  if (phase === "idle") {
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
            High-confidence transactions are imported automatically.
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
              icon: Brain,
              text: "AI-powered with auto-import for high-confidence matches",
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

        {/* Period selector */}
        <div className="flex flex-wrap justify-center gap-2">
          {SCAN_PERIODS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setSelectedPeriod(value)}
              className={`cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                selectedPeriod === value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button
          onClick={handleScan}
          size="lg"
          className="cursor-pointer gap-2"
        >
          <Search className="h-4 w-4" />
          Scan {SCAN_PERIODS.find((p) => p.value === selectedPeriod)?.label}
        </Button>
      </div>
    );
  }

  // ─── Scanning — antivirus pattern ──────────────
  if (phase === "scanning") {
    const foundCount = autoImportedCount + needsReviewCount;

    return (
      <div className="space-y-0">
        {/* ── Sticky progress header ── */}
        <div className="sticky top-0 z-10 bg-background pb-4">
          <div className="rounded-xl border bg-card p-5 shadow-sm space-y-4">
            {/* Top row: title + stop */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <Brain className="h-5 w-5 text-primary animate-pulse" />
                </div>
                <div>
                  <p className="text-sm font-semibold">
                    Scanning{scanLabel ? ` — ${scanLabel}` : ""}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {totalEmails > 0
                      ? `${totalEmails} emails · Batch ${currentBatch}/${totalBatches}`
                      : "Connecting to Gmail..."}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleStop}
                className="cursor-pointer gap-1.5 text-xs"
              >
                <Square className="h-3 w-3" />
                Stop
              </Button>
            </div>

            {/* Progress bar */}
            <ProgressBar current={currentBatch} total={totalBatches} />

            {/* Stats row */}
            {foundCount > 0 && (
              <div className="flex items-center gap-3 pt-1">
                {autoImportedCount > 0 && (
                  <div className="flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-1 dark:bg-green-900/30">
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                    <span className="text-xs font-medium text-green-700 dark:text-green-400">
                      {autoImportedCount} imported
                    </span>
                  </div>
                )}
                {needsReviewCount > 0 && (
                  <div className="flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 dark:bg-amber-900/30">
                    <AlertTriangle className="h-3 w-3 text-amber-600" />
                    <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
                      {needsReviewCount} to review
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Live transaction list ── */}
        {liveTransactions.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Analyzing emails with AI...
            </p>
          </div>
        ) : (
          <div className="rounded-xl border bg-card divide-y divide-border">
            {liveTransactions.map((txn, i) => (
              <TransactionRow
                key={`${txn.transactionRef || i}-${txn.date}-${i}`}
                txn={txn}
                isNew={i === lastAddedIndex}
              />
            ))}
            <div ref={listEndRef} />
          </div>
        )}
      </div>
    );
  }

  // ─── Import success ────────────────────────────
  if (phase === "imported") {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">All done!</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {autoImportedCount > 0 &&
              `${autoImportedCount} auto-imported. `}
            {importResult &&
              importResult.imported > 0 &&
              `${importResult.imported} reviewed & imported. `}
            {importResult &&
              importResult.skipped > 0 &&
              `${importResult.skipped} skipped (duplicates).`}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={resetToIdle}
          className="cursor-pointer"
        >
          Scan Again
        </Button>
      </div>
    );
  }

  // ─── Complete — summary + review queue ─────────
  const hasReviewItems = reviewQueue.length > 0;

  return (
    <div className="space-y-6">
      {/* Summary card */}
      <div className="rounded-lg border bg-card p-4 space-y-3">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <span className="font-medium">
            {wasCancelled ? "Scan stopped" : "Scan complete"}
          </span>
        </div>

        <div className="flex gap-6 text-sm">
          {autoImportedCount > 0 && (
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span>
                {autoImportedCount} auto-imported
              </span>
            </div>
          )}
          {needsReviewCount > 0 && (
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-amber-500" />
              <span>
                {needsReviewCount} need review
              </span>
            </div>
          )}
          {autoImportedCount === 0 && needsReviewCount === 0 && (
            <span className="text-muted-foreground">
              No new transactions found
            </span>
          )}
        </div>

        {undoResult !== null && (
          <p className="text-sm text-muted-foreground bg-muted rounded-md px-3 py-2">
            {undoResult} auto-imported transaction{undoResult !== 1 ? "s" : ""} removed.
          </p>
        )}

        <div className="flex gap-2">
          {autoImportedCount > 0 && scanBatchId && undoResult === null && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleUndo}
              disabled={undoing}
              className="cursor-pointer gap-1.5 text-xs"
            >
              {undoing ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Undo2 className="h-3 w-3" />
              )}
              Undo Auto-imports
            </Button>
          )}
          {!hasReviewItems && (
            <Button
              variant="outline"
              size="sm"
              onClick={resetToIdle}
              className="cursor-pointer text-xs"
            >
              Scan Again
            </Button>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Review queue */}
      {hasReviewItems && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-medium">
                Review {reviewQueue.length} transaction
                {reviewQueue.length !== 1 ? "s" : ""}
              </h3>
              <p className="text-xs text-muted-foreground">
                These need your approval before importing.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleAll}
                className="cursor-pointer text-xs"
              >
                {selected.size === reviewQueue.length
                  ? "Deselect All"
                  : "Select All"}
              </Button>
              <Button
                size="sm"
                onClick={handleImportReview}
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

          <div className="space-y-2">
            {reviewQueue.map((txn, i) => (
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
                  <div
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
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
                      <ConfidenceDot value={txn.confidence} />
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {txn.date}
                      </span>
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-1.5 py-0"
                      >
                        {txn.categoryIcon && `${txn.categoryIcon} `}{txn.categoryHint}
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

          <div className="flex justify-end pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={resetToIdle}
              className="cursor-pointer text-xs"
            >
              Skip Review & Scan Again
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
