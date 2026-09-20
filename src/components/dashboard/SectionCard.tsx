import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { useUiMode } from "@/lib/ui-mode";
import { cn } from "@/lib/utils";

/** Dashboard surface. Adapts between the premium (glass, gradients) and standard (flat, compact) looks. */
export function SectionCard({
  icon: Icon,
  title,
  description,
  actions,
  children,
  className,
}: {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  const { isPremium } = useUiMode();

  return (
    <section
      className={cn(
        "relative overflow-hidden border bg-card transition-shadow",
        isPremium
          ? "rounded-2xl border-border/70 p-6 shadow-[var(--shadow-soft)] hover:shadow-lg"
          : "rounded-lg border-border p-4 shadow-none",
        className,
      )}
    >
      {isPremium && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
        />
      )}
      {(title || actions) && (
        <div
          className={cn(
            "flex flex-wrap items-start justify-between gap-3",
            isPremium ? "mb-5" : "mb-3",
          )}
        >
          <div className="flex items-start gap-3">
            {Icon && (
              <span
                className={cn(
                  "flex shrink-0 items-center justify-center text-primary",
                  isPremium
                    ? "h-10 w-10 rounded-xl bg-primary/10 ring-1 ring-inset ring-primary/15"
                    : "h-8 w-8 rounded-md bg-muted",
                )}
              >
                <Icon className={isPremium ? "h-[18px] w-[18px]" : "h-4 w-4"} />
              </span>
            )}
            <div className="min-w-0">
              {title && (
                <h2
                  className={cn(
                    "font-semibold tracking-tight text-foreground",
                    isPremium ? "text-base" : "text-sm",
                  )}
                >
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
              )}
            </div>
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

const TONES: Record<string, string> = {
  success: "bg-emerald-500/10 text-emerald-600 ring-emerald-500/20 dark:text-emerald-400",
  warning: "bg-amber-500/10 text-amber-600 ring-amber-500/20 dark:text-amber-400",
  neutral: "bg-muted text-muted-foreground ring-border",
  info: "bg-primary/10 text-primary ring-primary/20",
};

export function StatusPill({
  tone = "neutral",
  children,
}: {
  tone?: keyof typeof TONES | string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide ring-1 ring-inset",
        TONES[tone] ?? TONES["neutral"],
      )}
    >
      {children}
    </span>
  );
}
