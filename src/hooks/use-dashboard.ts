"use client";

import { useEffect, useState, useCallback } from "react";
import apiClient from "@/lib/api-client";

interface DashboardSummary {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
}

interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  total: number;
  percentage: number;
}

interface MonthlyTrend {
  month: number;
  year: number;
  totalIncome: number;
  totalExpense: number;
}

interface UseDashboardResult {
  summary: DashboardSummary | null;
  categories: CategoryBreakdown[];
  trend: MonthlyTrend[];
  loading: boolean;
  error: string | null;
}

export function useDashboard(month: number, year: number): UseDashboardResult {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [categories, setCategories] = useState<CategoryBreakdown[]>([]);
  const [trend, setTrend] = useState<MonthlyTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [summaryRes, categoryRes, trendRes] = await Promise.all([
        apiClient.get("/api/dashboard/summary", { params: { month, year } }),
        apiClient.get("/api/dashboard/by-category", { params: { month, year } }),
        apiClient.get("/api/dashboard/monthly-trend", { params: { months: 6 } }),
      ]);

      setSummary(summaryRes.data.data ?? summaryRes.data);
      setCategories(categoryRes.data.data ?? categoryRes.data ?? []);
      setTrend(trendRes.data.data ?? trendRes.data ?? []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load dashboard"
      );
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { summary, categories, trend, loading, error };
}
