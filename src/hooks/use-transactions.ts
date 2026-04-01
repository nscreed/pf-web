"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import apiClient from "@/lib/api-client";

export interface Transaction {
  id: string;
  userId: number;
  amount: number;
  type: "income" | "expense";
  categoryId: string;
  currency: string;
  note: string | null;
  date: string;
  recurringRuleId: string | null;
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
    icon: string | null;
    type: string;
    isSystem: boolean;
  };
}

export interface FilterParams {
  type?: "income" | "expense";
  categoryId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

interface UseTransactionsResult {
  transactions: Transaction[];
  loading: boolean;
  hasMore: boolean;
  loadMore: () => void;
}

const LIMIT = 30;

export function useTransactions(filters: FilterParams): UseTransactionsResult {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const isFirstLoad = useRef(true);

  const fetchPage = useCallback(
    async (pageNum: number, append: boolean) => {
      setLoading(true);
      try {
        const params: Record<string, string | number> = {
          page: pageNum,
          limit: LIMIT,
        };
        if (filters.type) params.type = filters.type;
        if (filters.categoryId) params.categoryId = filters.categoryId;
        if (filters.dateFrom) params.dateFrom = filters.dateFrom;
        if (filters.dateTo) params.dateTo = filters.dateTo;
        if (filters.search) params.search = filters.search;

        const { data: res } = await apiClient.get("/api/transactions", { params });
        // Backend: TransformInterceptor wraps response in { statusCode, data: ..., timestamp }
        // Service returns: { data: Transaction[], meta: {...} }
        // So full shape is: { statusCode, data: { data: [...], meta: {...} }, timestamp }
        // Unwrap robustly:
        const outer = res.data ?? res; // { data: [...], meta: {...} } OR the array directly
        const items: Transaction[] = Array.isArray(outer)
          ? outer
          : Array.isArray(outer.data)
            ? outer.data
            : [];
        const meta = Array.isArray(outer) ? undefined : outer.meta;

        setTransactions((prev) => (append ? [...prev, ...items] : items));
        setHasMore(meta ? pageNum < meta.totalPages : items.length === LIMIT);
      } catch {
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    },
    [filters.type, filters.categoryId, filters.dateFrom, filters.dateTo, filters.search]
  );

  // Reset on filter change
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchPage(1, false);
    isFirstLoad.current = false;
  }, [fetchPage]);

  function loadMore() {
    if (loading || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPage(nextPage, true);
  }

  return { transactions, loading, hasMore, loadMore };
}
