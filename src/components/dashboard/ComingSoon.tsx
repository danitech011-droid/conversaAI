import type { LucideIcon } from "lucide-react";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

export function ComingSoon({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <DashboardLayout title={title} description="Coming soon">
      <div className="animate-slide-up mx-auto max-w-xl rounded-2xl border border-border bg-card p-10 text-center shadow-[var(--shadow-card)]">
        <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="h-7 w-7" />
        </span>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
        <p className="mt-8 inline-flex items-center rounded-full border border-border bg-surface px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Coming soon
        </p>
      </div>
    </DashboardLayout>
  );
}
