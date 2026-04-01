"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format-currency";
import { formatDate } from "@/lib/date-helpers";
import type { Transaction } from "@/hooks/use-transactions";

interface TransactionItemProps {
  transaction: Transaction;
}

export function TransactionItem({ transaction }: TransactionItemProps) {
  const isExpense = transaction.type === "expense";

  return (
    <Link
      href={`/transactions/${transaction.id}/edit`}
      className="flex items-center justify-between gap-4 rounded-lg border px-4 py-3 transition-colors hover:bg-accent"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-base">{transaction.category?.icon || "📦"}</span>
          <span className="truncate text-sm font-medium">
            {transaction.category?.name || "Uncategorized"}
          </span>
          {transaction.recurringRuleId && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              Recurring
            </Badge>
          )}
        </div>
        {transaction.note && (
          <p className="mt-0.5 truncate pl-7 text-xs text-muted-foreground">
            {transaction.note}
          </p>
        )}
      </div>

      <div className="shrink-0 text-right">
        <p
          className={`text-sm font-semibold ${isExpense ? "text-red-600" : "text-green-600"}`}
        >
          {isExpense ? "-" : "+"}
          {formatCurrency(transaction.amount)}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatDate(transaction.date)}
        </p>
      </div>
    </Link>
  );
}
