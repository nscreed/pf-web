"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Mail,
  Loader2,
  Check,
  Import,
  Search,
  Shield,
  CreditCard,
  RefreshCw,
  Brain,
  Inbox,
  ScanSearch,
  Sparkles,
  CircleCheck,
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

interface ScanStep {
  id: string;
  icon: typeof Mail;
  label: string;
  detail: string;
  duration: number; // ms to stay on this step
}

// ═══════════════════════════════════════════════════════
// Scan Animation Steps
// ═══════════════════════════════════════════════════════

const SCAN_STEPS: ScanStep[] = [
  {
    id: "connect",
    icon: Mail,
    label: "Connecting to Gmail",
    detail: "Establishing secure connection...",
    duration: 1200,
  },
  {
    id: "inbox",
    icon: Inbox,
    label: "Scanning inbox",
    detail: "Searching for transaction emails...",
    duration: 2000,
  },
  {
    id: "parse-mfs",
    icon: ScanSearch,
    label: "Detecting mobile banking",
    detail: "bKash, Nagad, Rocket...",
    duration: 1500,
  },
  {
    id: "parse-bank",
    icon: CreditCard,
    label: "Analyzing bank alerts",
    detail: "30+ Bangladesh banks, credit cards...",
    duration: 1500,
  },
  {
    id: "parse-subs",
    icon: RefreshCw,
    label: "Finding subscriptions",
    detail: "Netflix, Spotify, utilities...",
    duration: 1200,
  },
  {
    id: "categorize",
    icon: Brain,
    label: "Auto-categorizing",
    detail: "Matching merchants to categories...",
    duration: 1500,
  },
  {
    id: "dedup",
    icon: Shield,
    label: "Removing duplicates",
    detail: "Cross-checking transaction references...",
    duration: 1000,
  },
  {
    id: "done",
    icon: Sparkles,
    label: "Analysis complete",
    detail: "Preparing results...",
    duration: 800,
  },
];

// ═══════════════════════════════════════════════════════
// ScanningAnimation Component
// ═══════════════════════════════════════════════════════

function ScanningAnimation({
  currentStep,
  emailCount,
  detectedSources,
}: {
  currentStep: number;
  emailCount: number;
  detectedSources: string[];
}) {
  return (
    <div className="flex flex-col items-center gap-8 py-12">
      {/* Pulsing brain icon */}
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <Brain className="h-10 w-10 text-primary animate-pulse" />
        </div>
      </div>

      {/* Live counter */}
      <div className="text-center">
        <div className="text-3xl font-bold tabular-nums text-primary">
          {emailCount}
        </div>
        <div className="text-sm text-muted-foreground">emails analyzed</div>
      </div>

      {/* Steps */}
      <div className="w-full max-w-sm space-y-2">
        {SCAN_STEPS.map((step, i) => {
          const Icon = step.icon;
          const isActive = i === currentStep;
          const isDone = i < currentStep;
          const isPending = i > currentStep;

          return (
            <div
              key={step.id}
              className={`flex items-center gap-3 rounded-lg px-4 py-2.5 transition-all duration-500 ${
                isActive
                  ? "bg-primary/10 scale-[1.02]"
                  : isDone
                    ? "opacity-60"
                    : "opacity-20"
              }`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors duration-300 ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : isDone
                      ? "bg-green-100 text-green-600 dark:bg-green-900/30"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {isDone ? (
                  <CircleCheck className="h-4 w-4" />
                ) : isActive ? (
                  <Icon className="h-4 w-4 animate-pulse" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div
                  className={`text-sm font-medium ${isActive ? "text-foreground" : ""}`}
                >
                  {step.label}
                </div>
                {isActive && (
                  <div className="text-xs text-muted-foreground animate-in fade-in slide-in-from-left-2 duration-300">
                    {step.detail}
                  </div>
                )}
              </div>

              {isActive && (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" />
              )}
              {isDone && (
                <Check className="h-4 w-4 shrink-0 text-green-600" />
              )}
            </div>
          );
        })}
      </div>

      {/* Detected sources — appear one by one */}
      {detectedSources.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2">
          {detectedSources.map((source, i) => (
            <Badge
              key={source}
              variant="secondary"
              className="animate-in fade-in zoom-in duration-300 text-xs"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {source}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
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
// Main Component
// ═══════════════════════════════════════════════════════

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

  // Animation state
  const [scanStep, setScanStep] = useState(0);
  const [emailCount, setEmailCount] = useState(0);
  const [detectedSources, setDetectedSources] = useState<string[]>([]);
  const apiDone = useRef(false);
  const apiResult = useRef<ParsedTransaction[]>([]);

  const advanceSteps = useCallback(() => {
    let step = 0;
    const sources = ["bKash", "Nagad", "Rocket", "BRAC Bank", "Netflix", "Daraz"];

    const runStep = () => {
      if (step >= SCAN_STEPS.length) {
        // All steps done — wait for API if not ready yet, then finish
        const waitForApi = () => {
          if (apiDone.current) {
            finishScan();
          } else {
            setTimeout(waitForApi, 300);
          }
        };
        waitForApi();
        return;
      }

      setScanStep(step);

      // Simulate email count climbing
      const targetCount = Math.floor(((step + 1) / SCAN_STEPS.length) * 150);
      const countInterval = setInterval(() => {
        setEmailCount((prev) => {
          if (prev >= targetCount) {
            clearInterval(countInterval);
            return prev;
          }
          return prev + Math.ceil(Math.random() * 5);
        });
      }, 80);

      // Reveal detected sources at certain steps
      if (step === 2) setDetectedSources((prev) => [...prev, sources[0], sources[1], sources[2]]);
      if (step === 3) setDetectedSources((prev) => [...prev, sources[3]]);
      if (step === 4) setDetectedSources((prev) => [...prev, sources[4], sources[5]]);

      step++;
      setTimeout(runStep, SCAN_STEPS[step - 1].duration);
    };

    runStep();
  }, []);

  function finishScan() {
    const txns = apiResult.current;
    setParsed(txns);
    setSelected(
      new Set(
        txns
          .map((t, i) => (t.confidence >= 70 ? i : -1))
          .filter((i) => i >= 0),
      ),
    );
    setScanning(false);
    setScanned(true);
  }

  async function handleScan() {
    setScanning(true);
    setError(null);
    setResult(null);
    setScanStep(0);
    setEmailCount(0);
    setDetectedSources([]);
    apiDone.current = false;
    apiResult.current = [];

    // Start animation
    advanceSteps();

    // Fire API in parallel
    try {
      const { data } = await apiClient.get("/api/email-parser/scan", {
        params: { days: 30 },
      });
      const txns = data.data?.transactions ?? data.transactions ?? [];
      apiResult.current = txns;
      apiDone.current = true;

      // If animation already past step 6, it will finish itself.
      // If API returns super fast, we still let animation play out
      // for at least the first 5 steps (minimum ~7 seconds)
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        "Failed to scan emails. Try re-logging in.";
      setError(msg);
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

  // ─── Scanning animation ────────────────────────
  if (scanning) {
    return (
      <ScanningAnimation
        currentStep={scanStep}
        emailCount={emailCount}
        detectedSources={detectedSources}
      />
    );
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
            { icon: Shield, text: "Read-only access — we never send or modify emails" },
            { icon: CreditCard, text: "Detects bKash, Nagad, Rocket, 30+ BD banks, credit cards" },
            { icon: Brain, text: "AI-powered categorization with confidence scoring" },
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
          size="lg"
          className="cursor-pointer gap-2"
        >
          <Search className="h-4 w-4" />
          Scan Last 30 Days
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
              {result.skipped} skipped (duplicates)
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

              <div className="text-right shrink-0">
                <span
                  className={`text-sm font-semibold ${
                    txn.type === "income" ? "text-green-600" : "text-red-600"
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
