import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

type StepProgressProps = {
  steps: readonly string[];
  current: number; // 0-based
};

export function StepProgress({ steps, current }: StepProgressProps) {
  const percent = ((current + 1) / steps.length) * 100;

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">
          Step {current + 1} of {steps.length}
        </p>
        <p className="text-sm text-muted-foreground">{steps[current]}</p>
      </div>

      <div
        className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-secondary"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={steps.length}
        aria-valuenow={current + 1}
        aria-label={`Onboarding progress: step ${current + 1} of ${steps.length}`}
      >
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>

      <ol className="mt-4 hidden gap-2 sm:grid sm:grid-cols-4">
        {steps.map((step, index) => {
          const done = index < current;
          const active = index === current;
          return (
            <li key={step} className="flex items-center gap-2">
              <span
                className={cn(
                  "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
                  done && "border-success bg-success text-success-foreground",
                  active && "border-primary bg-primary text-primary-foreground",
                  !done && !active && "border-border bg-background text-muted-foreground",
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : index + 1}
              </span>
              <span
                className={cn(
                  "truncate text-xs",
                  active ? "font-medium text-foreground" : "text-muted-foreground",
                )}
              >
                {step}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
