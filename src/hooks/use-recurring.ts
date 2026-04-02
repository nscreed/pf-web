"use client";

import { useEffect, useState, useCallback } from "react";
import apiClient from "@/lib/api-client";

export interface RecurringRule {
  id: string;
  userId: number;
  amount: number;
  type: "income" | "expense";
  categoryId: string;
  currency: string;
  note: string | null;
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  originalDay: number | null;
  startDate: string;
  nextDate: string;
  endDate: string | null;
  lastTriggeredAt: string | null;
  status: "active" | "paused";
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

export interface CreateRecurringData {
  amount: number;
  type: "income" | "expense";
  categoryId: string;
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  startDate: string;
  currency?: string;
  note?: string;
  endDate?: string;
}

export interface UpdateRecurringData {
  amount?: number;
  categoryId?: string;
  note?: string;
  endDate?: string;
}

interface UseRecurringResult {
  rules: RecurringRule[];
  loading: boolean;
  refresh: () => void;
  create: (data: CreateRecurringData) => Promise<void>;
  update: (id: string, data: UpdateRecurringData) => Promise<void>;
  toggle: (id: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export function useRecurring(): UseRecurringResult {
  const [rules, setRules] = useState<RecurringRule[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRules = useCallback(async () => {
    setLoading(true);
    try {
      const { data: res } = await apiClient.get("/api/recurring");
      const outer = res.data ?? res;
      const items: RecurringRule[] = Array.isArray(outer) ? outer : [];
      setRules(items);
    } catch {
      setRules([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  async function create(data: CreateRecurringData) {
    await apiClient.post("/api/recurring", data);
    await fetchRules();
  }

  async function update(id: string, data: UpdateRecurringData) {
    await apiClient.patch(`/api/recurring/${id}`, data);
    await fetchRules();
  }

  async function toggle(id: string) {
    await apiClient.patch(`/api/recurring/${id}/toggle`);
    await fetchRules();
  }

  async function remove(id: string) {
    await apiClient.delete(`/api/recurring/${id}`);
    await fetchRules();
  }

  return { rules, loading, refresh: fetchRules, create, update, toggle, remove };
}
