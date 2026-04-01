"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/layout/page-header";
import { FilterBar } from "@/components/transactions/filter-bar";
import { TransactionList } from "@/components/transactions/transaction-list";
import { EmailScanner } from "@/components/transactions/email-scanner";
import {
  useTransactions,
  type FilterParams,
} from "@/hooks/use-transactions";
import { useCategories } from "@/hooks/use-categories";

export default function TransactionsPage() {
  const [filters, setFilters] = useState<FilterParams>({});
  const { transactions, loading, hasMore, loadMore } = useTransactions(filters);
  const { categories } = useCategories();

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Transactions"
        subtitle="View and manage your transactions."
        action={
          <Link href="/transactions/new">
            <Button size="sm" className="cursor-pointer">
              <Plus className="mr-1 h-4 w-4" />
              Add
            </Button>
          </Link>
        }
      />

      <div className="px-4 lg:px-8">
        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all" className="cursor-pointer">
              All Transactions
            </TabsTrigger>
            <TabsTrigger value="recurring" className="cursor-pointer">
              Recurring
            </TabsTrigger>
            <TabsTrigger value="smart-import" className="cursor-pointer gap-1.5">
              <Mail className="h-3.5 w-3.5" />
              Smart Import
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <FilterBar
              filters={filters}
              onChange={setFilters}
              categories={categories}
            />
            <TransactionList
              transactions={transactions}
              loading={loading}
              hasMore={hasMore}
              onLoadMore={loadMore}
            />
          </TabsContent>

          <TabsContent value="recurring">
            <p className="py-12 text-center text-sm text-muted-foreground">
              Recurring transactions coming soon.
            </p>
          </TabsContent>

          <TabsContent value="smart-import">
            <EmailScanner />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
