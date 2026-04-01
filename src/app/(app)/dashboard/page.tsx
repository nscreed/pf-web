"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { MonthSelector } from "@/components/dashboard/month-selector";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { ExpensePieChart } from "@/components/dashboard/expense-pie-chart";
import { MonthlyBarChart } from "@/components/dashboard/monthly-bar-chart";
import { AiInsights } from "@/components/dashboard/ai-insights";
import { useDashboard } from "@/hooks/use-dashboard";
import { useAuth } from "@/providers/auth-provider";

export default function DashboardPage() {
  const { user } = useAuth();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const { summary, categories, trend, loading, error } = useDashboard(
    month,
    year
  );

  function handleMonthChange(m: number, y: number) {
    setMonth(m);
    setYear(y);
  }

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title={`Welcome back${user?.name ? `, ${user.name.split(" ")[0]}` : ""}!`}
        subtitle="Here's your dashboard overview."
      />

      <div className="space-y-6 px-4 lg:px-8">
        <MonthSelector month={month} year={year} onChange={handleMonthChange} />

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : error ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            {error}
          </div>
        ) : (
          <>
            <SummaryCards
              totalBalance={summary?.totalBalance ?? 0}
              monthlyIncome={summary?.monthlyIncome ?? 0}
              monthlyExpense={summary?.monthlyExpense ?? 0}
            />

            <div className="grid gap-6 lg:grid-cols-2">
              <ExpensePieChart data={categories} />
              <MonthlyBarChart data={trend} />
            </div>

            <AiInsights
              month={month}
              year={year}
              hasData={categories.length > 0 || (summary?.monthlyExpense ?? 0) > 0}
            />
          </>
        )}
      </div>
    </div>
  );
}
