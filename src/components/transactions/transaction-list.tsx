"use client";

import { useEffect, useRef } from "react";
import { Receipt } from "lucide-react";
import { TransactionItem } from "./transaction-item";
import type { Transaction } from "@/hooks/use-transactions";

interface TransactionListProps {
  transactions: Transaction[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

export function TransactionList({
  transactions,
  loading,
  hasMore,
  onLoadMore,
}: TransactionListProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loading, onLoadMore]);

  if (!loading && transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <Receipt className="mb-3 h-10 w-10" />
        <p className="text-sm font-medium">No transactions found</p>
        <p className="mt-1 text-xs">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {transactions.map((t) => (
        <TransactionItem key={t.id} transaction={t} />
      ))}

      {hasMore && (
        <div ref={sentinelRef} className="flex justify-center py-4">
          {loading && (
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          )}
        </div>
      )}

      {!hasMore && transactions.length > 0 && (
        <p className="py-4 text-center text-xs text-muted-foreground">
          All transactions loaded
        </p>
      )}
    </div>
  );
}
