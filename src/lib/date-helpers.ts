export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getDateRange(preset: "today" | "week" | "month"): {
  from: string;
  to: string;
} {
  const now = new Date();
  const to = now.toISOString().split("T")[0];

  switch (preset) {
    case "today":
      return { from: to, to };
    case "week": {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 6);
      return { from: weekAgo.toISOString().split("T")[0], to };
    }
    case "month": {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from: monthStart.toISOString().split("T")[0], to };
    }
  }
}

export function isToday(date: string): boolean {
  return new Date(date).toDateString() === new Date().toDateString();
}

export function isYesterday(date: string): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return new Date(date).toDateString() === yesterday.toDateString();
}
