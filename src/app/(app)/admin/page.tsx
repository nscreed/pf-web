"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  X,
  Loader2,
  Coins,
  Users,
  Gift,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import apiClient from "@/lib/api-client";
import { useAuth } from "@/providers/auth-provider";

interface CreditRequest {
  id: string;
  userId: number;
  reason: string;
  status: string;
  creditsGranted: number | null;
  adminNote: string | null;
  createdAt: string;
  user: {
    id: number;
    name: string;
    email: string;
    credits: number;
  };
}

interface UserRow {
  id: number;
  name: string;
  email: string;
  credits: number;
  role: string;
  createdAt: string;
}

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState<CreditRequest[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [grantAmounts, setGrantAmounts] = useState<Record<string, string>>({});
  const [grantUserId, setGrantUserId] = useState("");
  const [grantAmount, setGrantAmount] = useState("");
  const [granting, setGranting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Guard: redirect non-admins
  useEffect(() => {
    if (user && user.role !== "admin") {
      router.push("/dashboard");
    }
  }, [user, router]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [reqRes, userRes] = await Promise.all([
        apiClient.get("/api/admin/credit-requests"),
        apiClient.get("/api/admin/users"),
      ]);
      setRequests(reqRes.data.data ?? reqRes.data ?? []);
      setUsers(userRes.data.data ?? userRes.data ?? []);
    } catch {
      // Not admin or error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === "admin") fetchData();
  }, [user, fetchData]);

  async function handleApprove(requestId: string) {
    const credits = parseInt(grantAmounts[requestId] || "20");
    if (!credits || credits <= 0) return;

    setProcessingId(requestId);
    try {
      await apiClient.post(`/api/admin/credit-requests/${requestId}/approve`, {
        credits,
      });
      fetchData();
    } catch {
      setMessage("Failed to approve");
    } finally {
      setProcessingId(null);
    }
  }

  async function handleReject(requestId: string) {
    setProcessingId(requestId);
    try {
      await apiClient.post(`/api/admin/credit-requests/${requestId}/reject`, {});
      fetchData();
    } catch {
      setMessage("Failed to reject");
    } finally {
      setProcessingId(null);
    }
  }

  async function handleGrantCredits() {
    const uid = parseInt(grantUserId);
    const amt = parseInt(grantAmount);
    if (!uid || !amt || amt <= 0) return;

    setGranting(true);
    setMessage(null);
    try {
      const { data } = await apiClient.post(
        `/api/admin/users/${uid}/grant-credits`,
        { credits: amt },
      );
      const res = data.data ?? data;
      setMessage(`Granted ${amt} credits. New balance: ${res.credits}`);
      setGrantUserId("");
      setGrantAmount("");
      fetchData();
    } catch {
      setMessage("Failed to grant credits");
    } finally {
      setGranting(false);
    }
  }

  if (user?.role !== "admin") return null;

  const pendingRequests = requests.filter((r) => r.status === "pending");

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Admin" subtitle="Manage users and credit requests." />

      <div className="space-y-6 px-4 pb-8 lg:px-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs defaultValue="requests">
            <TabsList className="mb-4">
              <TabsTrigger value="requests" className="cursor-pointer gap-1.5">
                <Coins className="h-3.5 w-3.5" />
                Requests
                {pendingRequests.length > 0 && (
                  <Badge variant="destructive" className="ml-1 text-[10px] px-1.5 py-0">
                    {pendingRequests.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="users" className="cursor-pointer gap-1.5">
                <Users className="h-3.5 w-3.5" />
                Users
              </TabsTrigger>
              <TabsTrigger value="grant" className="cursor-pointer gap-1.5">
                <Gift className="h-3.5 w-3.5" />
                Grant Credits
              </TabsTrigger>
            </TabsList>

            {/* ── Credit Requests ── */}
            <TabsContent value="requests" className="space-y-3">
              {pendingRequests.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  No pending requests
                </div>
              ) : (
                pendingRequests.map((req) => (
                  <Card key={req.id}>
                    <CardContent className="flex items-start gap-4 p-4">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {req.user.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {req.user.email}
                          </span>
                          <Badge variant="outline" className="text-[10px]">
                            {req.user.credits} credits
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          &ldquo;{req.reason}&rdquo;
                        </p>
                        <p className="text-[11px] text-muted-foreground/60">
                          {new Date(req.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Input
                          type="number"
                          placeholder="20"
                          value={grantAmounts[req.id] || ""}
                          onChange={(e) =>
                            setGrantAmounts((prev) => ({
                              ...prev,
                              [req.id]: e.target.value,
                            }))
                          }
                          className="w-20 text-sm"
                        />
                        <Button
                          size="icon-sm"
                          onClick={() => handleApprove(req.id)}
                          disabled={processingId === req.id}
                          className="cursor-pointer bg-green-600 hover:bg-green-700"
                        >
                          {processingId === req.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Check className="h-3.5 w-3.5" />
                          )}
                        </Button>
                        <Button
                          size="icon-sm"
                          variant="destructive"
                          onClick={() => handleReject(req.id)}
                          disabled={processingId === req.id}
                          className="cursor-pointer"
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            {/* ── Users ── */}
            <TabsContent value="users">
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left text-muted-foreground">
                          <th className="px-4 py-3 font-medium">User</th>
                          <th className="px-4 py-3 font-medium">Email</th>
                          <th className="px-4 py-3 font-medium text-right">
                            Credits
                          </th>
                          <th className="px-4 py-3 font-medium">Role</th>
                          <th className="px-4 py-3 font-medium">Joined</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u) => (
                          <tr key={u.id} className="border-b last:border-0">
                            <td className="px-4 py-3 font-medium">{u.name}</td>
                            <td className="px-4 py-3 text-muted-foreground">
                              {u.email}
                            </td>
                            <td className="px-4 py-3 text-right tabular-nums font-semibold">
                              {u.credits}
                            </td>
                            <td className="px-4 py-3">
                              <Badge
                                variant={u.role === "admin" ? "default" : "outline"}
                                className="text-[10px]"
                              >
                                {u.role}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-muted-foreground text-xs">
                              {new Date(u.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── Grant Credits ── */}
            <TabsContent value="grant">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Grant Credits to User
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {message && (
                    <p className="text-sm text-muted-foreground bg-muted rounded-md px-3 py-2">
                      {message}
                    </p>
                  )}
                  <div className="flex gap-3">
                    <Input
                      type="number"
                      placeholder="User ID"
                      value={grantUserId}
                      onChange={(e) => setGrantUserId(e.target.value)}
                      className="w-32"
                    />
                    <Input
                      type="number"
                      placeholder="Credits"
                      value={grantAmount}
                      onChange={(e) => setGrantAmount(e.target.value)}
                      className="w-32"
                    />
                    <Button
                      onClick={handleGrantCredits}
                      disabled={granting || !grantUserId || !grantAmount}
                      className="cursor-pointer gap-1.5"
                    >
                      {granting ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Gift className="h-3.5 w-3.5" />
                      )}
                      Grant
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enter the user ID and number of credits to grant directly.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
