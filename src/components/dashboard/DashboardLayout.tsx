import { useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  BarChart3,
  Bell,
  BookOpen,
  Gem,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Radio,
  Settings,
  Sparkles,
  ShieldCheck,
  Square,
  Users,
  UserSquare2,
} from "lucide-react";

import { Logo, LogoLockup } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { signOutCleanly } from "@/lib/auth-helpers";
import { useUiMode } from "@/lib/ui-mode";
import { cn } from "@/lib/utils";

type NavItem = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  soon?: boolean;
};

export const NAV_ITEMS: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/knowledge-base", label: "Knowledge Base", icon: BookOpen },
  { to: "/test-ai", label: "Test AI", icon: Sparkles },
  { to: "/channels", label: "Channels", icon: Radio },
  { to: "/team", label: "Team", icon: Users },
  { to: "/audit-log", label: "Audit Log", icon: History },
  { to: "/customers", label: "Customers", icon: UserSquare2, soon: true },
  { to: "/conversations", label: "Conversations", icon: MessageSquare, soon: true },
  { to: "/analytics", label: "Analytics", icon: BarChart3, soon: true },
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/admin", label: "Admin console", icon: ShieldCheck },
];


function NavLinks({
  collapsed,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <nav className="flex flex-1 flex-col gap-1 px-3">
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.to;
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            title={collapsed ? item.label : undefined}
            className={cn(
              "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary/12 text-primary shadow-[inset_0_0_0_1px_color-mix(in_oklch,var(--color-primary)_22%,transparent)]"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
              collapsed && "justify-center px-0",
            )}
          >
            <Icon className="h-[18px] w-[18px] shrink-0" />
            {!collapsed && (
              <>
                <span className="truncate">{item.label}</span>
                {item.soon && (
                  <span className="ml-auto rounded-full border border-border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    Soon
                  </span>
                )}
              </>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export function DashboardLayout({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { mode, toggleMode, isPremium } = useUiMode();

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await signOutCleanly();
    navigate({ to: "/login", replace: true });
  }

  const initials = (user?.email ?? "?").slice(0, 2).toUpperCase();

  return (
    <div className={cn("relative flex min-h-dvh bg-background", isPremium && "surface-glow")}>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "sticky top-0 z-20 hidden h-dvh shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200 lg:flex",
          isPremium && "bg-sidebar/85 backdrop-blur-xl",
          collapsed ? "w-[76px]" : "w-64",
        )}
      >
        <div className={cn("flex h-16 items-center px-4", collapsed && "justify-center px-0")}>
          <Link to="/dashboard" aria-label="ConversaAI dashboard">
            {collapsed ? (
              <Logo variant="mark" className="h-8" />
            ) : (
              <LogoLockup />
            )}
          </Link>
        </div>
        <NavLinks collapsed={collapsed} />
        <div className="border-t border-border p-3">
          <button
            onClick={handleSignOut}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
              collapsed && "justify-center px-0",
            )}
          >
            <LogOut className="h-[18px] w-[18px]" />
            {!collapsed && "Logout"}
          </button>
          <button
            onClick={() => setCollapsed((value) => !value)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
              collapsed && "justify-center px-0",
            )}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-[18px] w-[18px]" />
            ) : (
              <>
                <PanelLeftClose className="h-[18px] w-[18px]" />
                Collapse
              </>
            )}
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 border-b border-border/80 bg-background/75 backdrop-blur-xl">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 bg-sidebar p-0">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <div className="flex h-16 items-center px-4">
                  <LogoLockup />
                </div>
                <NavLinks onNavigate={() => setMobileOpen(false)} />
                <div className="border-t border-border p-3">
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    <LogOut className="h-[18px] w-[18px]" />
                    Logout
                  </button>
                </div>
              </SheetContent>
            </Sheet>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">{title}</p>
              {description && (
                <p className="truncate text-xs text-muted-foreground">{description}</p>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMode}
              className="hidden gap-2 sm:inline-flex"
              title="Switch between the premium and standard interface"
            >
              {mode === "premium" ? (
                <Gem className="h-4 w-4 text-primary" />
              ) : (
                <Square className="h-4 w-4" />
              )}
              <span className="text-xs font-medium capitalize">{mode} UI</span>
            </Button>

            <ThemeToggle />

            <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-cyan" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  aria-label="Profile menu"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
                >
                  {initials}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="truncate font-normal text-muted-foreground">
                  {user?.email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => navigate({ to: "/settings" })}>
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => navigate({ to: "/onboarding" })}>
                  Business profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={handleSignOut}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 animate-fade-in px-4 py-8 sm:px-6">
          {actions && <div className="mb-6 flex flex-wrap gap-2">{actions}</div>}
          {children}
        </main>
      </div>
    </div>
  );
}
