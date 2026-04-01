"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Download, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/date-helpers";
import apiClient from "@/lib/api-client";

export function ExportSection() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [dateFrom, setDateFrom] = useState(
    monthStart.toISOString().split("T")[0]
  );
  const [dateTo, setDateTo] = useState(now.toISOString().split("T")[0]);
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    setDownloading(true);
    try {
      const response = await apiClient.get("/api/export/csv", {
        params: { dateFrom, dateTo },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = `transactions_${dateFrom}_${dateTo}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Export Data</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex-1 space-y-2">
            <Label>From</Label>
            <Popover open={fromOpen} onOpenChange={setFromOpen}>
              <PopoverTrigger
                render={
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start text-left font-normal cursor-pointer"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formatDate(dateFrom)}
                  </Button>
                }
              />
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={new Date(dateFrom + "T00:00:00")}
                  onSelect={(d) => {
                    if (d) {
                      setDateFrom(d.toISOString().split("T")[0]);
                      setFromOpen(false);
                    }
                  }}
                  disabled={{ after: new Date() }}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex-1 space-y-2">
            <Label>To</Label>
            <Popover open={toOpen} onOpenChange={setToOpen}>
              <PopoverTrigger
                render={
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start text-left font-normal cursor-pointer"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formatDate(dateTo)}
                  </Button>
                }
              />
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={new Date(dateTo + "T00:00:00")}
                  onSelect={(d) => {
                    if (d) {
                      setDateTo(d.toISOString().split("T")[0]);
                      setToOpen(false);
                    }
                  }}
                  disabled={{ after: new Date() }}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <Button
          onClick={handleDownload}
          disabled={downloading}
          className="cursor-pointer"
        >
          {downloading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Download CSV
        </Button>
      </CardContent>
    </Card>
  );
}
