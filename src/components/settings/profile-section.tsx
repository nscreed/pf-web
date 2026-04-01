"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Check } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import apiClient from "@/lib/api-client";

const CURRENCIES = [
  { value: "BDT", label: "BDT (৳)" },
  { value: "USD", label: "USD ($)" },
  { value: "EUR", label: "EUR (€)" },
  { value: "GBP", label: "GBP (£)" },
  { value: "INR", label: "INR (₹)" },
];

const TIMEZONES = [
  "Asia/Dhaka",
  "Asia/Kolkata",
  "Asia/Tokyo",
  "Europe/London",
  "Europe/Berlin",
  "America/New_York",
  "America/Chicago",
  "America/Los_Angeles",
  "Pacific/Auckland",
  "UTC",
];

export function ProfileSection() {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [currency, setCurrency] = useState(user?.defaultCurrency || "BDT");
  const [timezone, setTimezone] = useState(user?.timezone || "Asia/Dhaka");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      await apiClient.patch("/api/profile", {
        name,
        defaultCurrency: currency,
        timezone,
      });
      await refreshUser();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
          />
        </div>

        <div className="space-y-2">
          <Label>Default Currency</Label>
          <Select value={currency} onValueChange={(v) => setCurrency(v ?? "BDT")}>
            <SelectTrigger className="w-full">
              <SelectValue>
                {(value: string | null) => {
                  const c = CURRENCIES.find((x) => x.value === value);
                  return c?.label || "Select currency";
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((c) => (
                <SelectItem key={c.value} value={c.value} label={c.label}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Timezone</Label>
          <Select value={timezone} onValueChange={(v) => setTimezone(v ?? "Asia/Dhaka")}>
            <SelectTrigger className="w-full">
              <SelectValue>
                {(value: string | null) => value || "Select timezone"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {TIMEZONES.map((tz) => (
                <SelectItem key={tz} value={tz} label={tz}>
                  {tz}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="cursor-pointer"
        >
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : saved ? (
            <Check className="mr-2 h-4 w-4" />
          ) : null}
          {saved ? "Saved!" : "Save Changes"}
        </Button>
      </CardContent>
    </Card>
  );
}
