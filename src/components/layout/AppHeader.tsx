import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { LogoLockup } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { signOutCleanly } from "@/lib/auth-helpers";

export function AppHeader() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await signOutCleanly();
    navigate({ to: "/login", replace: true });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link to="/" aria-label="ConversaAI home" className="rounded-md">
          <LogoLockup />
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <span className="hidden max-w-[180px] truncate text-sm text-muted-foreground sm:inline">
            {user?.email}
          </span>
          <Button variant="outline" size="sm" className="h-9 gap-2" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </div>
    </header>
  );
}
