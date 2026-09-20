import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { Logo } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

type AuthLayoutProps = {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthLayout({ title, description, children, footer }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center bg-background px-4 py-10 surface-glow sm:px-6">
      <div className="pointer-events-none absolute inset-0 bg-grid-subtle opacity-60" aria-hidden />

      <div className="absolute right-4 top-4 z-10 sm:right-6 sm:top-6">
        <ThemeToggle />
      </div>

      <div className="relative w-full max-w-md animate-slide-up">
        <Link
          to="/"
          aria-label="ConversaAI home"
          className="mx-auto mb-6 flex w-fit items-center justify-center rounded-lg"
        >
          <Logo />
        </Link>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-elevated)] sm:p-8">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          <div className="mt-6">{children}</div>
        </div>

        {footer ? <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div> : null}
      </div>
    </div>
  );
}
