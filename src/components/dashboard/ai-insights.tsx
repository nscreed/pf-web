"use client";

import { useCallback, useEffect, useState } from "react";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import apiClient from "@/lib/api-client";

interface AiInsightsProps {
  month: number;
  year: number;
  hasData: boolean;
}

export function AiInsights({ month, year, hasData }: AiInsightsProps) {
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  const fetchInsights = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get("/api/dashboard/insights", {
        params: { month, year },
      });
      const res = data.data ?? data;
      setInsights(res.insights || []);
    } catch {
      setInsights([]);
    } finally {
      setLoading(false);
      setFetched(true);
    }
  }, [month, year]);

  // Reset when month changes
  useEffect(() => {
    setFetched(false);
    setInsights([]);
  }, [month, year]);

  if (!hasData) return null;

  // Not yet fetched — show CTA
  if (!fetched && !loading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">AI Spending Insights</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Get personalized tips based on your spending patterns
            </p>
          </div>
          <Button
            size="sm"
            onClick={fetchInsights}
            className="cursor-pointer gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Analyze My Spending
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Loading
  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center gap-3 py-10">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">
            Analyzing your spending patterns...
          </span>
        </CardContent>
      </Card>
    );
  }

  // No insights returned
  if (insights.length === 0) {
    return null;
  }

  // Show insights
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">AI Insights</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={fetchInsights}
            disabled={loading}
            className="cursor-pointer"
            title="Refresh insights"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {insights.map((insight, i) => (
          <div
            key={i}
            className="flex gap-3 rounded-lg bg-muted/50 px-3.5 py-2.5"
          >
            <span className="mt-0.5 text-sm leading-none text-primary/70">
              {i + 1}.
            </span>
            <p className="text-sm leading-relaxed text-foreground/90">
              {insight}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
