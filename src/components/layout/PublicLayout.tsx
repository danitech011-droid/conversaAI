import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useEffect } from "react";

import { LogoLockup } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { to: "/#features", label: "Features" },
  { to: "/#how-it-works", label: "How it works" },
  { to: "/#product", label: "Product" },
  { to: "/#contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname + s.location.hash });

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 shadow-[0_1px_0_color-mix(in_oklch,var(--color-card)_60%,transparent)] backdrop-blur-2xl">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex h-[4.5rem] w-full max-w-6xl items-center justify-between px-4 sm:px-6"
      >
        <Link
          to="/"
          aria-label="ConversaAI home"
          className="rounded-xl transition-transform hover:scale-[1.01]"
        >
          <LogoLockup />
        </Link>

        <ul className="hidden items-center gap-1 rounded-2xl border border-border/70 bg-card/60 p-1 shadow-[var(--shadow-soft)] md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                className={cn(
                  "rounded-xl px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary/70 hover:text-foreground",
                  pathname === link.to.replace("/", "") && "bg-navy text-navy-foreground shadow-sm",
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          {user ? (
            <Button asChild>
              <Link to="/dashboard">Go to dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" className="text-muted-foreground">
                <Link to="/login">Sign in</Link>
              </Button>
              <Button asChild className="shadow-[var(--shadow-soft)]">
                <Link to="/register">Get started</Link>
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle className="md:hidden" />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-border text-foreground transition-colors hover:bg-secondary md:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {open ? (
        <div className="animate-fade-in border-t border-border bg-background md:hidden">
          <ul className="mx-auto flex w-full max-w-6xl flex-col px-4 py-2 sm:px-6">
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-2 py-3 text-base font-medium text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="flex flex-col gap-2 py-3">
              {user ? (
                <Button asChild onClick={() => setOpen(false)}>
                  <Link to="/dashboard">Go to dashboard</Link>
                </Button>
              ) : (
                <>
                  <Button asChild variant="outline" onClick={() => setOpen(false)}>
                    <Link to="/login">Sign in</Link>
                  </Button>
                  <Button asChild onClick={() => setOpen(false)}>
                    <Link to="/register">Get started</Link>
                  </Button>
                </>
              )}
            </li>
            <li className="border-t border-border pt-3">
              <Button asChild variant="outline" className="w-full" onClick={() => setOpen(false)}>
                <Link to="/register">Get started</Link>
              </Button>
            </li>
          </ul>
        </div>
      ) : null}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70 bg-surface/50">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div>
          <LogoLockup />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
            AI-powered customer engagement for websites and WhatsApp. Built by Dani-Tech to help
            businesses respond, recommend, and convert around the clock.
          </p>
        </div>
        <ul className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
          {NAV_LINKS.map((link) => (
            <li key={link.to}>
              <Link to={link.to} className="transition-colors hover:text-foreground">
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <Link to="/login" className="transition-colors hover:text-foreground">
              Sign in
            </Link>
          </li>
        </ul>
      </div>
      <div className="border-t border-border/70">
        <p className="mx-auto w-full max-w-6xl px-4 py-4 text-xs text-muted-foreground sm:px-6">
          Copyright © {new Date().getFullYear()} Dani-Tech. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export function PublicLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const storageKey = "conversaai-visitor-session";
    const sessionId = window.localStorage.getItem(storageKey) ?? crypto.randomUUID();
    window.localStorage.setItem(storageKey, sessionId);
    const deviceType = window.matchMedia("(max-width: 767px)").matches ? "mobile" : "desktop";

    void supabase.from("visitor_events").insert({
      session_id: sessionId,
      path: window.location.pathname,
      referrer: document.referrer || null,
      user_agent: navigator.userAgent,
      device_type: deviceType,
    });
  }, []);

  return (
    <div className="relative flex min-h-dvh flex-col bg-background surface-glow">
      <SiteHeader />
      <main className="relative flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
