"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import {
  TransactionForm,
  type TransactionFormData,
} from "@/components/transactions/transaction-form";
import { QuickEntry } from "@/components/transactions/quick-entry";
import apiClient from "@/lib/api-client";

export default function NewTransactionPage() {
  const router = useRouter();
  const [prefill, setPrefill] = useState<Partial<TransactionFormData>>();

  const handleQuickSelect = useCallback(
    (data: Partial<TransactionFormData>) => {
      setPrefill({ ...data });
    },
    []
  );

  async function handleSubmit(data: TransactionFormData) {
    await apiClient.post("/api/transactions", data);
    router.push("/transactions");
  }

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader title="Add Transaction" />
      <div className="space-y-6 px-4 lg:px-8">
        <QuickEntry onSelect={handleQuickSelect} />
        <TransactionForm
          key={JSON.stringify(prefill)}
          defaultValues={prefill}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
