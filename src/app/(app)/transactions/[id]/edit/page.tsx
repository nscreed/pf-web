"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import {
  TransactionForm,
  type TransactionFormData,
} from "@/components/transactions/transaction-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import apiClient from "@/lib/api-client";
import type { Transaction } from "@/hooks/use-transactions";

export default function EditTransactionPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    apiClient
      .get(`/api/transactions/${id}`)
      .then(({ data }) => setTransaction(data.data ?? data))
      .catch(() => router.replace("/transactions"))
      .finally(() => setLoading(false));
  }, [id, router]);

  async function handleSubmit(data: TransactionFormData) {
    await apiClient.patch(`/api/transactions/${id}`, data);
    router.push("/transactions");
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await apiClient.delete(`/api/transactions/${id}`);
      router.push("/transactions");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!transaction) return null;

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader title="Edit Transaction" />
      <div className="space-y-6 px-4 lg:px-8">
        <TransactionForm
          defaultValues={{
            amount: transaction.amount,
            type: transaction.type,
            categoryId: transaction.categoryId,
            date: transaction.date,
            note: transaction.note || "",
            currency: transaction.currency,
          }}
          onSubmit={handleSubmit}
          isEdit
        />

        {/* Delete */}
        <div className="border-t pt-4">
          <Button
            type="button"
            variant="outline"
            className="w-full cursor-pointer text-destructive hover:bg-destructive/10"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Transaction
          </Button>
        </div>

        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Transaction</DialogTitle>
              <DialogDescription>
                Are you sure? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose
                render={
                  <Button variant="outline" className="cursor-pointer">
                    Cancel
                  </Button>
                }
              />
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleting}
                className="cursor-pointer"
              >
                {deleting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
