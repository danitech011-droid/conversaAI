import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut, Menu, ShieldCheck, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { Logo } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { signOutCleanly } from "@/lib/auth-helpers";
import { cn } from "@/lib/utils";

export function AdminLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await signOutCleanly();
    navigate({ to: "/admin-login", replace: true });
  }

  return (
    <div className="min-h-dvh bg-background text-foreground surface-glow">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border bg-card/80 p-5 backdrop-blur-xl lg:flex">
        <AdminBrand />
        <div className="mt-10 rounded-2xl border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            <ShieldCheck className="h-4 w-4" /> Private admin
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Manage public leads and understand how people use your website.</p>
        </div>
        <div className="mt-auto space-y-2">
          <p className="truncate px-3 text-xs text-muted-foreground">{user?.email}</p>
          <button type="button" onClick={handleSignOut} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"><LogOut className="h-4 w-4" /> Sign out</button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3"><button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border lg:hidden" onClick={() => setMobileOpen((open) => !open)} aria-label={mobileOpen ? "Close admin menu" : "Open admin menu"}>{mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}</button><div><p className="text-sm font-semibold">Admin workspace</p><p className="hidden text-xs text-muted-foreground sm:block">ConversaAI operations</p></div></div>
            <div className="flex items-center gap-2"><ThemeToggle /><Button asChild variant="outline" size="sm" className="hidden sm:inline-flex"><Link to="/">View website</Link></Button></div>
          </div>
        </header>
        {mobileOpen ? <div className="fixed inset-0 z-20 bg-background/95 p-5 pt-20 backdrop-blur-xl lg:hidden"><AdminBrand /><div className="mt-8 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">Private admin workspace for leads and visitor activity.</div><button type="button" onClick={handleSignOut} className="mt-6 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"><LogOut className="h-4 w-4" /> Sign out</button></div> : null}
        <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

function AdminBrand() {
  return <Link to="/admin" className="flex items-center gap-3" aria-label="Admin dashboard"><Logo variant="mark" className="h-10 w-10" /><span className={cn("text-lg font-bold tracking-tight text-navy dark:text-slate-50")}>Conversa<span className="text-cyan">AI</span></span></Link>;
}
