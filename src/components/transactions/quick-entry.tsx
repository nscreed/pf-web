"use client";

import { useEffect, useState } from "react";
import apiClient from "@/lib/api-client";
import { formatCurrency } from "@/lib/format-currency";
import type { Transaction } from "@/hooks/use-transactions";
import type { TransactionFormData } from "./transaction-form";

interface QuickEntryProps {
  onSelect: (data: Partial<TransactionFormData>) => void;
}

export function QuickEntry({ onSelect }: QuickEntryProps) {
  const [recent, setRecent] = useState<Transaction[]>([]);

  useEffect(() => {
    apiClient
      .get("/api/transactions/recent")
      .then(({ data }) => setRecent(data.data ?? data ?? []))
      .catch(() => {});
  }, []);

  if (recent.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">Recent</p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {recent.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() =>
              onSelect({
                amount: t.amount,
                type: t.type,
                categoryId: t.categoryId,
                note: t.note || "",
                currency: t.currency,
              })
            }
            className="flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors hover:bg-accent cursor-pointer"
          >
            <span>{t.category?.icon || "📦"}</span>
            <span>{formatCurrency(t.amount, t.currency)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
