import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

export function Spinner({ className }: { className?: string }) {
  return (
    <Loader2 className={cn("h-5 w-5 animate-spin", className)} role="status" aria-label="Loading" />
  );
}

export function FullPageSpinner({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-surface">
      <Spinner className="h-6 w-6 text-primary" />
      <p className="text-sm text-muted-foreground">{label}…</p>
    </div>
  );
}
