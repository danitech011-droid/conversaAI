import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { completeOAuthRedirect } from "@/lib/auth-helpers";

export const Route = createFileRoute("/auth/callback")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Signing you in — ConversaAI" },
      { name: "description", content: "Finishing Google sign-in for your ConversaAI workspace." },
    ],
  }),
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    completeOAuthRedirect().then((result) => {
      if (cancelled) return;
      if (result.ok) {
        navigate({ to: result.to, replace: true });
        return;
      }
      setError(result.message);
    });

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <AuthLayout
      title={error ? "Google sign-in didn't finish" : "Signing you in"}
      description={
        error
          ? "You can go back and try again with Google or email."
          : "Just a moment while we open your workspace."
      }
    >
      {error ? (
        <div className="space-y-4">
          <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
          <Button asChild className="h-11 w-full">
            <Link to="/login">Back to sign in</Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 py-6">
          <Spinner className="h-6 w-6 text-primary" />
          <p className="text-sm text-muted-foreground">Connecting your Google account…</p>
        </div>
      )}
    </AuthLayout>
  );
}
