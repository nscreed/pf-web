"use client";

import { useState } from "react";
import { Pause, Play, Trash2, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/format-currency";
import { formatDate } from "@/lib/date-helpers";
import type { RecurringRule } from "@/hooks/use-recurring";

interface RecurringItemProps {
  rule: RecurringRule;
  onToggle: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onEdit: (rule: RecurringRule) => void;
}

const frequencyLabels: Record<string, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  yearly: "Yearly",
};

export function RecurringItem({ rule, onToggle, onDelete, onEdit }: RecurringItemProps) {
  const isExpense = rule.type === "expense";
  const isPaused = rule.status === "paused";
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  async function handleToggle(e: React.MouseEvent) {
    e.stopPropagation();
    setToggling(true);
    try {
      await onToggle(rule.id);
    } finally {
      setToggling(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await onDelete(rule.id);
      setDeleteOpen(false);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-lg border px-4 py-3 transition-colors hover:bg-accent cursor-pointer ${isPaused ? "opacity-60" : ""}`}
      onClick={() => onEdit(rule)}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-base">{rule.category?.icon || "📦"}</span>
          <span className="truncate text-sm font-medium">
            {rule.category?.name || "Uncategorized"}
          </span>
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
            {frequencyLabels[rule.frequency]}
          </Badge>
          <Badge
            variant={isPaused ? "outline" : "default"}
            className="text-[10px] px-1.5 py-0"
          >
            {isPaused ? "Paused" : "Active"}
          </Badge>
        </div>
        <div className="mt-0.5 flex items-center gap-2 pl-7 text-xs text-muted-foreground">
          {rule.note && <span className="truncate">{rule.note}</span>}
          {rule.note && <span>·</span>}
          <span>Next: {formatDate(rule.nextDate)}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <div className="text-right mr-1">
          <p
            className={`text-sm font-semibold tabular-nums ${isExpense ? "text-red-600" : "text-green-600"}`}
          >
            {isExpense ? "-" : "+"}
            {formatCurrency(rule.amount)}
          </p>
        </div>

        <Button
          variant="ghost"
          size="icon-sm"
          className="cursor-pointer"
          onClick={handleToggle}
          disabled={toggling}
        >
          {toggling ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isPaused ? (
            <Play className="h-4 w-4" />
          ) : (
            <Pause className="h-4 w-4" />
          )}
        </Button>

        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="cursor-pointer text-destructive hover:text-destructive"
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
              />
            }
          >
            <Trash2 className="h-4 w-4" />
          </DialogTrigger>
          <DialogContent onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <DialogHeader>
              <DialogTitle>Delete Recurring Rule</DialogTitle>
              <DialogDescription>
                This will stop future auto-entries. Past transactions will remain.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" className="cursor-pointer" />}>
                Cancel
              </DialogClose>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleting}
                className="cursor-pointer"
              >
                {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
