"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { getDateRange } from "@/lib/date-helpers";
import type { Category } from "@/hooks/use-categories";
import type { FilterParams } from "@/hooks/use-transactions";

interface FilterBarProps {
  filters: FilterParams;
  onChange: (filters: FilterParams) => void;
  categories: Category[];
}

type DatePreset = "all" | "today" | "week" | "month" | "custom";

export function FilterBar({ filters, onChange, categories }: FilterBarProps) {
  const [searchInput, setSearchInput] = useState(filters.search || "");
  const [datePreset, setDatePreset] = useState<DatePreset>("all");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({ from: undefined, to: undefined });

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== (filters.search || "")) {
        onChange({ ...filters, search: searchInput || undefined });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]); // eslint-disable-line react-hooks/exhaustive-deps

  const setType = useCallback(
    (type: FilterParams["type"]) => {
      onChange({ ...filters, type });
    },
    [filters, onChange]
  );

  function handleDatePreset(preset: DatePreset) {
    setDatePreset(preset);
    if (preset === "all") {
      onChange({ ...filters, dateFrom: undefined, dateTo: undefined });
    } else if (preset === "custom") {
      setCalendarOpen(true);
    } else {
      const range = getDateRange(preset);
      onChange({ ...filters, dateFrom: range.from, dateTo: range.to });
    }
  }

  function handleCalendarSelect(range: { from?: Date; to?: Date } | undefined) {
    if (!range) return;
    setDateRange({ from: range.from, to: range.to });
    if (range.from && range.to) {
      onChange({
        ...filters,
        dateFrom: range.from.toISOString().split("T")[0],
        dateTo: range.to.toISOString().split("T")[0],
      });
      setCalendarOpen(false);
    }
  }

  function toggleCategory(categoryId: string) {
    const current = filters.categoryId;
    onChange({
      ...filters,
      categoryId: current === categoryId ? undefined : categoryId,
    });
  }

  const activeFilterCount = [
    filters.dateFrom,
    filters.categoryId,
  ].filter(Boolean).length;

  const typeButtons = (
    <div className="flex gap-1">
      {(
        [
          { value: undefined, label: "All" },
          { value: "income", label: "Income" },
          { value: "expense", label: "Expense" },
        ] as const
      ).map((item) => (
        <Button
          key={item.label}
          variant={filters.type === item.value ? "default" : "outline"}
          size="sm"
          onClick={() => setType(item.value as FilterParams["type"])}
          className="cursor-pointer text-xs"
        >
          {item.label}
        </Button>
      ))}
    </div>
  );

  const dateButtons = (
    <div className="flex flex-wrap gap-1">
      {(
        [
          { value: "all", label: "All Time" },
          { value: "today", label: "Today" },
          { value: "week", label: "This Week" },
          { value: "month", label: "This Month" },
          { value: "custom", label: "Custom" },
        ] as const
      ).map((item) => (
        <Button
          key={item.value}
          variant={datePreset === item.value ? "default" : "outline"}
          size="sm"
          onClick={() => handleDatePreset(item.value)}
          className="cursor-pointer text-xs"
        >
          {item.label}
        </Button>
      ))}
    </div>
  );

  const categoryList = (
    <div className="flex flex-wrap gap-1.5">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => toggleCategory(cat.id)}
          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors cursor-pointer ${
            filters.categoryId === cat.id
              ? "border-primary bg-primary/10 text-primary"
              : "border-border hover:bg-accent"
          }`}
        >
          {cat.icon && <span>{cat.icon}</span>}
          {cat.name}
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-3">
      {/* Row 1: Type toggle + Search + Filter button (mobile) */}
      <div className="flex items-center gap-2">
        {typeButtons}

        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="h-9 pl-9 text-sm"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Mobile: Filters sheet */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger
            render={
              <Button
                variant="outline"
                size="sm"
                className="lg:hidden cursor-pointer relative"
              >
                <SlidersHorizontal className="h-4 w-4" />
                {activeFilterCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            }
          />
          <SheetContent side="bottom" className="max-h-[70vh]">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="space-y-4 py-4">
              <div>
                <p className="mb-2 text-sm font-medium">Date Range</p>
                {dateButtons}
              </div>
              {calendarOpen && (
                <div className="rounded-lg border p-2">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={handleCalendarSelect}
                    numberOfMonths={1}
                  />
                </div>
              )}
              <div>
                <p className="mb-2 text-sm font-medium">Category</p>
                {categoryList}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop: Date + Category filters inline */}
      <div className="hidden space-y-3 lg:block">
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-muted-foreground">Date:</span>
          {dateButtons}
          {calendarOpen && (
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger
                render={
                  <Button variant="outline" size="sm" className="text-xs">
                    {dateRange.from
                      ? `${dateRange.from.toLocaleDateString()} — ${dateRange.to?.toLocaleDateString() || "..."}`
                      : "Pick dates"}
                  </Button>
                }
              />
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={handleCalendarSelect}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          )}
        </div>
        {categories.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-muted-foreground">Category:</span>
            {categoryList}
          </div>
        )}
      </div>

      {/* Active filter badges */}
      {(filters.categoryId || filters.dateFrom) && (
        <div className="flex flex-wrap items-center gap-1.5">
          {filters.categoryId && (
            <Badge variant="secondary" className="gap-1 text-xs">
              {categories.find((c) => c.id === filters.categoryId)?.name}
              <button
                onClick={() => onChange({ ...filters, categoryId: undefined })}
                className="cursor-pointer"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.dateFrom && (
            <Badge variant="secondary" className="gap-1 text-xs">
              {filters.dateFrom} — {filters.dateTo}
              <button
                onClick={() => {
                  setDatePreset("all");
                  onChange({
                    ...filters,
                    dateFrom: undefined,
                    dateTo: undefined,
                  });
                }}
                className="cursor-pointer"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
