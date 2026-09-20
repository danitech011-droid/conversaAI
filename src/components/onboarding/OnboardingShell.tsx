import { ArrowLeft, ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

import { LogoLockup } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ONBOARDING_STEPS } from "@/lib/onboarding/types";
import { cn } from "@/lib/utils";

export function OnboardingProgress({ current }: { current: number }) {
  const total = ONBOARDING_STEPS.length;
  const percent = ((current + 1) / total) * 100;
  const step = ONBOARDING_STEPS[current];

  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-medium text-foreground">
          Step {current + 1} of {total}
        </p>
        <p className="truncate text-sm text-muted-foreground">{step?.label}</p>
      </div>
      <div
        className="mt-3 h-1 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={current + 1}
        aria-label={`Onboarding progress: step ${current + 1} of ${total}, ${step?.label ?? ""}`}
      >
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-400 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
      <ol className="mt-4 hidden gap-1 sm:flex">
        {ONBOARDING_STEPS.map((item, index) => {
          const done = index < current;
          const active = index === current;
          return (
            <li key={item.id} className="min-w-0 flex-1">
              <span
                className={cn(
                  "block h-1 rounded-full transition-colors",
                  done || active ? "bg-primary" : "bg-border",
                )}
              />
              <span
                className={cn(
                  "mt-2 block truncate text-[11px]",
                  active ? "font-medium text-foreground" : "text-muted-foreground",
                )}
              >
                {item.label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function OnboardingShell({
  current,
  title,
  subtitle,
  children,
  onBack,
  onContinue,
  onSkip,
  continueLabel = "Continue",
  skipLabel = "Skip for now",
  saving = false,
  continueDisabled = false,
}: {
  current: number;
  title: string;
  subtitle: string;
  children: ReactNode;
  onBack?: (() => void) | undefined;
  onContinue: () => void;
  onSkip?: (() => void) | undefined;
  continueLabel?: string;
  skipLabel?: string;
  saving?: boolean;
  continueDisabled?: boolean;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="border-b border-border/70 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
          <LogoLockup />
          <ThemeToggle />
        </div>
      </header>

      <div className="mx-auto w-full max-w-5xl px-4 pt-8 sm:px-6 sm:pt-10">
        <OnboardingProgress current={current} />
      </div>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-10 sm:px-6">
        <div key={current} className="animate-slide-up">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-[2rem]">
            {title}
          </h1>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </main>

      <footer className="sticky bottom-0 border-t border-border/70 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-2xl flex-col-reverse gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex gap-2">
            {onBack ? (
              <Button type="button" variant="ghost" className="h-11 gap-2" onClick={onBack} disabled={saving}>
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            ) : (
              <span className="hidden sm:inline" />
            )}
            {onSkip ? (
              <Button type="button" variant="ghost" className="h-11" onClick={onSkip} disabled={saving}>
                {skipLabel}
              </Button>
            ) : null}
          </div>
          <Button
            type="button"
            className="h-11 gap-2 sm:min-w-40"
            onClick={onContinue}
            disabled={saving || continueDisabled}
          >
            {saving ? <Spinner className="h-4 w-4" /> : null}
            {saving ? "Saving…" : continueLabel}
            {!saving ? <ArrowRight className="h-4 w-4" /> : null}
          </Button>
        </div>
      </footer>
    </div>
  );
}
