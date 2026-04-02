"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/date-helpers";
import { useCategories } from "@/hooks/use-categories";
import { useAuth } from "@/providers/auth-provider";
import type { CreateRecurringData, RecurringRule } from "@/hooks/use-recurring";

interface RecurringFormProps {
  editRule?: RecurringRule;
  onSubmit: (data: CreateRecurringData) => Promise<void>;
  onUpdate?: (id: string, data: { amount?: number; categoryId?: string; note?: string; endDate?: string }) => Promise<void>;
}

export function RecurringForm({ editRule, onSubmit, onUpdate }: RecurringFormProps) {
  const { user } = useAuth();
  const { categories } = useCategories();
  const isEdit = !!editRule;

  const today = new Date().toISOString().split("T")[0];

  const [type, setType] = useState<"income" | "expense">(editRule?.type || "expense");
  const [amountStr, setAmountStr] = useState(editRule ? String(editRule.amount) : "");
  const [categoryId, setCategoryId] = useState(editRule?.categoryId || "");
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly" | "yearly">(editRule?.frequency || "monthly");
  const [startDate, setStartDate] = useState(editRule?.startDate || today);
  const [endDate, setEndDate] = useState(editRule?.endDate || "");
  const [note, setNote] = useState(editRule?.note || "");
  const [currency, setCurrency] = useState(editRule?.currency || user?.defaultCurrency || "BDT");
  const [startCalendarOpen, setStartCalendarOpen] = useState(false);
  const [endCalendarOpen, setEndCalendarOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filteredCategories = categories.filter(
    (c) => c.type === type || c.type === "both"
  );

  const expenseCategories = filteredCategories.filter(
    (c) => c.type === "expense" || c.type === "both"
  );
  const incomeCategories = filteredCategories.filter(
    (c) => c.type === "income" || c.type === "both"
  );

  function handleTypeChange(newType: "income" | "expense") {
    setType(newType);
    const compatible = categories.filter(
      (c) => c.type === newType || c.type === "both"
    );
    if (!compatible.some((c) => c.id === categoryId)) {
      setCategoryId("");
    }
  }

  function handleAmountChange(value: string) {
    const cleaned = value.replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    if (parts.length > 2) return;
    if (parts[1] && parts[1].length > 2) return;
    setAmountStr(cleaned);
  }

  function handleAmountBlur() {
    if (!amountStr) return;
    const num = parseFloat(amountStr);
    if (!isNaN(num)) {
      setAmountStr(num.toFixed(2));
    }
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    const amount = parseFloat(amountStr);
    if (!amountStr || isNaN(amount) || amount <= 0) {
      errs.amount = "Amount must be greater than 0";
    }
    if (!categoryId) {
      errs.categoryId = "Category is required";
    }
    if (!isEdit && !startDate) {
      errs.startDate = "Start date is required";
    }
    if (endDate && startDate && endDate < startDate) {
      errs.endDate = "End date must be after start date";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      if (isEdit && onUpdate) {
        await onUpdate(editRule.id, {
          amount: parseFloat(amountStr),
          categoryId,
          note: note || undefined,
          endDate: endDate || undefined,
        });
      } else {
        await onSubmit({
          amount: parseFloat(amountStr),
          type,
          categoryId,
          frequency,
          startDate,
          currency,
          note: note || undefined,
          endDate: endDate || undefined,
        });
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Type toggle - disabled in edit mode */}
      <div className="space-y-2">
        <Label>Type</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={type === "expense" ? "default" : "outline"}
            size="sm"
            onClick={() => handleTypeChange("expense")}
            disabled={isEdit}
            className="flex-1 cursor-pointer"
          >
            Expense
          </Button>
          <Button
            type="button"
            variant={type === "income" ? "default" : "outline"}
            size="sm"
            onClick={() => handleTypeChange("income")}
            disabled={isEdit}
            className="flex-1 cursor-pointer"
          >
            Income
          </Button>
        </div>
      </div>

      {/* Amount */}
      <div className="space-y-2">
        <Label htmlFor="rec-amount">Amount</Label>
        <Input
          id="rec-amount"
          inputMode="decimal"
          placeholder="0.00"
          value={amountStr}
          onChange={(e) => handleAmountChange(e.target.value)}
          onBlur={handleAmountBlur}
          className="text-lg font-semibold"
        />
        {errors.amount && (
          <p className="text-xs text-destructive">{errors.amount}</p>
        )}
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label>Category</Label>
        <Select value={categoryId} onValueChange={(v) => setCategoryId(v ?? "")}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select category">
              {(value: string | null) => {
                if (!value) return "Select category";
                const cat = categories.find((c) => c.id === value);
                return cat ? `${cat.icon || ""} ${cat.name}` : "Select category";
              }}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {type === "expense" && expenseCategories.length > 0 && (
              <SelectGroup>
                <SelectLabel>Expense</SelectLabel>
                {expenseCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id} label={`${cat.icon || ""} ${cat.name}`}>
                    {cat.icon && <span>{cat.icon}</span>} {cat.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            )}
            {type === "income" && incomeCategories.length > 0 && (
              <SelectGroup>
                <SelectLabel>Income</SelectLabel>
                {incomeCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id} label={`${cat.icon || ""} ${cat.name}`}>
                    {cat.icon && <span>{cat.icon}</span>} {cat.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            )}
          </SelectContent>
        </Select>
        {errors.categoryId && (
          <p className="text-xs text-destructive">{errors.categoryId}</p>
        )}
      </div>

      {/* Frequency - disabled in edit mode */}
      <div className="space-y-2">
        <Label>Frequency</Label>
        <Select value={frequency} onValueChange={(v) => setFrequency(v as typeof frequency)} disabled={isEdit}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily" label="Daily">Daily</SelectItem>
            <SelectItem value="weekly" label="Weekly">Weekly</SelectItem>
            <SelectItem value="monthly" label="Monthly">Monthly</SelectItem>
            <SelectItem value="yearly" label="Yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Start Date - only for create */}
      {!isEdit && (
        <div className="space-y-2">
          <Label>Start Date</Label>
          <Popover open={startCalendarOpen} onOpenChange={setStartCalendarOpen}>
            <PopoverTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start text-left font-normal cursor-pointer"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formatDate(startDate)}
                </Button>
              }
            />
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={new Date(startDate + "T00:00:00")}
                onSelect={(d) => {
                  if (d) {
                    setStartDate(d.toISOString().split("T")[0]);
                    setStartCalendarOpen(false);
                  }
                }}
              />
            </PopoverContent>
          </Popover>
          {errors.startDate && (
            <p className="text-xs text-destructive">{errors.startDate}</p>
          )}
        </div>
      )}

      {/* End Date (optional) */}
      <div className="space-y-2">
        <Label>End Date (optional)</Label>
        <Popover open={endCalendarOpen} onOpenChange={setEndCalendarOpen}>
          <PopoverTrigger
            render={
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start text-left font-normal cursor-pointer"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? formatDate(endDate) : "No end date"}
              </Button>
            }
          />
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={endDate ? new Date(endDate + "T00:00:00") : undefined}
              onSelect={(d) => {
                if (d) {
                  setEndDate(d.toISOString().split("T")[0]);
                  setEndCalendarOpen(false);
                }
              }}
              disabled={{ before: new Date(startDate + "T00:00:00") }}
            />
          </PopoverContent>
        </Popover>
        {endDate && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setEndDate("")}
            className="text-xs text-muted-foreground cursor-pointer"
          >
            Clear end date
          </Button>
        )}
        {errors.endDate && (
          <p className="text-xs text-destructive">{errors.endDate}</p>
        )}
      </div>

      {/* Note */}
      <div className="space-y-2">
        <Label htmlFor="rec-note">Note (optional)</Label>
        <Input
          id="rec-note"
          placeholder="e.g. Netflix subscription"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={500}
        />
      </div>

      {/* Currency - only for create */}
      {!isEdit && (
        <div className="space-y-2">
          <Label>Currency</Label>
          <Select value={currency} onValueChange={(v) => setCurrency(v ?? "BDT")}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BDT" label="BDT (৳)">BDT (৳)</SelectItem>
              <SelectItem value="USD" label="USD ($)">USD ($)</SelectItem>
              <SelectItem value="EUR" label="EUR (€)">EUR (€)</SelectItem>
              <SelectItem value="GBP" label="GBP (£)">GBP (£)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Submit */}
      <Button
        type="submit"
        disabled={submitting}
        className="w-full cursor-pointer"
      >
        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isEdit ? "Save Changes" : "Create Recurring Rule"}
      </Button>
    </form>
  );
}
