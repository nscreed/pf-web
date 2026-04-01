import { PageHeader } from "@/components/layout/page-header";

export default function RecurringPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Recurring" subtitle="Manage recurring transactions." />
      <div className="px-4 lg:px-8">
        <p className="text-muted-foreground">Recurring transactions coming soon.</p>
      </div>
    </div>
  );
}
