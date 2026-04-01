"use client";

import { useEffect, useState, useCallback } from "react";
import apiClient from "@/lib/api-client";

export interface Category {
  id: string;
  name: string;
  icon: string | null;
  type: "income" | "expense" | "both";
  isSystem: boolean;
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = useCallback(() => {
    setLoading(true);
    apiClient
      .get("/api/categories")
      .then(({ data }) => setCategories(data.data ?? data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { categories, loading, refresh: fetchCategories };
}
