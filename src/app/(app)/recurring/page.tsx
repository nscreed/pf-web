"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/layout/page-header";
import { RecurringList } from "@/components/recurring/recurring-list";
import { RecurringForm } from "@/components/recurring/recurring-form";
import { useRecurring, type RecurringRule } from "@/hooks/use-recurring";

export default function RecurringPage() {
  const { rules, loading, create, update, toggle, remove } = useRecurring();
  const [createOpen, setCreateOpen] = useState(false);
  const [editRule, setEditRule] = useState<RecurringRule | null>(null);

  async function handleCreate(data: Parameters<typeof create>[0]) {
    await create(data);
    setCreateOpen(false);
  }

  async function handleUpdate(id: string, data: Parameters<typeof update>[1]) {
    await update(id, data);
    setEditRule(null);
  }

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Recurring"
        subtitle="Manage recurring transactions."
        action={
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger
              render={
                <Button size="sm" className="cursor-pointer">
                  <Plus className="mr-1 h-4 w-4" />
                  Add
                </Button>
              }
            />
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>New Recurring Rule</DialogTitle>
              </DialogHeader>
              <RecurringForm onSubmit={handleCreate} />
            </DialogContent>
          </Dialog>
        }
      />

      <div className="px-4 lg:px-8">
        <RecurringList
          rules={rules}
          loading={loading}
          onToggle={toggle}
          onDelete={remove}
          onEdit={setEditRule}
        />
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editRule} onOpenChange={(open) => !open && setEditRule(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Recurring Rule</DialogTitle>
          </DialogHeader>
          {editRule && (
            <RecurringForm
              editRule={editRule}
              onSubmit={handleCreate}
              onUpdate={handleUpdate}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
