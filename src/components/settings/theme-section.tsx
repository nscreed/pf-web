"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "@/providers/theme-provider";
import apiClient from "@/lib/api-client";

const THEMES = [
  { value: "blue" as const, label: "Blue", color: "hsl(221 83% 53%)" },
  { value: "natural" as const, label: "Natural", color: "hsl(142 71% 40%)" },
  { value: "energetic" as const, label: "Energetic", color: "hsl(262 83% 58%)" },
];

export function ThemeSection() {
  const { theme, setTheme } = useTheme();

  function handleSelect(value: "blue" | "natural" | "energetic") {
    setTheme(value);
    apiClient.patch("/api/profile", { theme: value }).catch(() => {});
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Theme</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-3">
          {THEMES.map((t) => (
            <button
              key={t.value}
              onClick={() => handleSelect(t.value)}
              className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors cursor-pointer ${
                theme === t.value
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div
                className="h-8 w-8 rounded-full"
                style={{ backgroundColor: t.color }}
              />
              <span className="text-xs font-medium">{t.label}</span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
