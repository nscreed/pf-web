"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { useCategories, type Category } from "@/hooks/use-categories";
import { useAuth } from "@/providers/auth-provider";

export interface TransactionFormData {
  amount: number;
  type: "income" | "expense";
  categoryId: string;
  date: string;
  note: string;
  currency: string;
}

interface TransactionFormProps {
  defaultValues?: Partial<TransactionFormData>;
  onSubmit: (data: TransactionFormData) => Promise<void>;
  isEdit?: boolean;
}

const LAST_CATEGORY_KEY = "pf_last_category";

function getLastCategory(type: string): string | null {
  try {
    const stored = localStorage.getItem(LAST_CATEGORY_KEY);
    if (!stored) return null;
    const map = JSON.parse(stored);
    return map[type] || null;
  } catch {
    return null;
  }
}

function setLastCategory(type: string, categoryId: string) {
  try {
    const stored = localStorage.getItem(LAST_CATEGORY_KEY);
    const map = stored ? JSON.parse(stored) : {};
    map[type] = categoryId;
    localStorage.setItem(LAST_CATEGORY_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

export function TransactionForm({
  defaultValues,
  onSubmit,
  isEdit,
}: TransactionFormProps) {
  const { user } = useAuth();
  const { categories } = useCategories();

  const today = new Date().toISOString().split("T")[0];

  const [type, setType] = useState<"income" | "expense">(
    defaultValues?.type || "expense"
  );
  const [amountStr, setAmountStr] = useState(
    defaultValues?.amount ? String(defaultValues.amount) : ""
  );
  const [categoryId, setCategoryId] = useState(defaultValues?.categoryId || "");
  const [date, setDate] = useState(defaultValues?.date || today);
  const [note, setNote] = useState(defaultValues?.note || "");
  const [currency, setCurrency] = useState(
    defaultValues?.currency || user?.defaultCurrency || "BDT"
  );
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Set default category from localStorage when categories load
  useEffect(() => {
    if (categoryId || categories.length === 0) return;
    const last = getLastCategory(type);
    if (last && categories.some((c) => c.id === last)) {
      setCategoryId(last);
    }
  }, [categories, type, categoryId]);

  // Filter categories by type
  const filteredCategories = categories.filter(
    (c) => c.type === type || c.type === "both"
  );

  const expenseCategories = filteredCategories.filter(
    (c) => c.type === "expense" || c.type === "both"
  );
  const incomeCategories = filteredCategories.filter(
    (c) => c.type === "income" || c.type === "both"
  );

  // When type changes, reset category if not compatible
  function handleTypeChange(newType: "income" | "expense") {
    setType(newType);
    const compatible = categories.filter(
      (c) => c.type === newType || c.type === "both"
    );
    if (!compatible.some((c) => c.id === categoryId)) {
      const last = getLastCategory(newType);
      if (last && compatible.some((c) => c.id === last)) {
        setCategoryId(last);
      } else {
        setCategoryId("");
      }
    }
  }

  function handleAmountChange(value: string) {
    // Only allow digits and one decimal point
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

  function handleDateSelect(selected: Date | undefined) {
    if (!selected) return;
    setDate(selected.toISOString().split("T")[0]);
    setCalendarOpen(false);
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
    if (!date) {
      errs.date = "Date is required";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      setLastCategory(type, categoryId);
      await onSubmit({
        amount: parseFloat(amountStr),
        type,
        categoryId,
        date,
        note,
        currency,
      });
    } finally {
      setSubmitting(false);
    }
  }

  // Pre-fill from external data (quick entry)
  useEffect(() => {
    if (!defaultValues) return;
    if (defaultValues.type) setType(defaultValues.type);
    if (defaultValues.amount) setAmountStr(String(defaultValues.amount));
    if (defaultValues.categoryId) setCategoryId(defaultValues.categoryId);
    if (defaultValues.note !== undefined) setNote(defaultValues.note);
    if (defaultValues.currency) setCurrency(defaultValues.currency);
    if (defaultValues.date) setDate(defaultValues.date);
  }, [defaultValues]);

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Type toggle */}
      <div className="space-y-2">
        <Label>Type</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={type === "expense" ? "default" : "outline"}
            size="sm"
            onClick={() => handleTypeChange("expense")}
            className="flex-1 cursor-pointer"
          >
            Expense
          </Button>
          <Button
            type="button"
            variant={type === "income" ? "default" : "outline"}
            size="sm"
            onClick={() => handleTypeChange("income")}
            className="flex-1 cursor-pointer"
          >
            Income
          </Button>
        </div>
      </div>

      {/* Amount */}
      <div className="space-y-2">
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
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

      {/* Date */}
      <div className="space-y-2">
        <Label>Date</Label>
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger
            render={
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start text-left font-normal cursor-pointer"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formatDate(date)}
              </Button>
            }
          />
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={new Date(date + "T00:00:00")}
              onSelect={handleDateSelect}
              disabled={{ after: new Date() }}
            />
          </PopoverContent>
        </Popover>
        {errors.date && (
          <p className="text-xs text-destructive">{errors.date}</p>
        )}
      </div>

      {/* Note */}
      <div className="space-y-2">
        <Label htmlFor="note">Note (optional)</Label>
        <Input
          id="note"
          placeholder="What was this for?"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={500}
        />
      </div>

      {/* Currency */}
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

      {/* Submit */}
      <Button
        type="submit"
        disabled={submitting}
        className="w-full cursor-pointer"
      >
        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isEdit ? "Save Changes" : "Add Transaction"}
      </Button>
    </form>
  );
}
