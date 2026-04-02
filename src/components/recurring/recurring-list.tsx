"use client";

import { RefreshCw } from "lucide-react";
import { RecurringItem } from "./recurring-item";
import type { RecurringRule } from "@/hooks/use-recurring";

interface RecurringListProps {
  rules: RecurringRule[];
  loading: boolean;
  onToggle: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onEdit: (rule: RecurringRule) => void;
}

export function RecurringList({ rules, loading, onToggle, onDelete, onEdit }: RecurringListProps) {
  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (rules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <RefreshCw className="mb-3 h-10 w-10" />
        <p className="text-sm font-medium">No recurring rules yet</p>
        <p className="mt-1 text-xs">Set up auto-entries for rent, salary, subscriptions, etc.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {rules.map((rule) => (
        <RecurringItem
          key={rule.id}
          rule={rule}
          onToggle={onToggle}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}
