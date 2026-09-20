import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { supabase } from "@/integrations/supabase/client";
import { resolvePostLoginPath } from "@/lib/auth-helpers";

export const Route = createFileRoute("/verify-email")({
  head: () => ({
    meta: [
      { title: "Email verified — ConversaAI" },
      { name: "description", content: "Your ConversaAI email address has been verified." },
      { property: "og:title", content: "Email verified — ConversaAI" },
      { property: "og:description", content: "Your account is confirmed and ready to use." },
    ],
  }),
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setVerified(Boolean(data.user));
      setChecking(false);
    });
  }, []);

  async function handleContinue() {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      navigate({ to: "/login" });
      return;
    }
    const to = await resolvePostLoginPath(data.user.id);
    navigate({ to, replace: true });
  }

  return (
    <AuthLayout
      title={verified ? "Email verified" : "Verify your email"}
      description={
        verified
          ? "Your ConversaAI account is confirmed and ready to go."
          : "Open the confirmation link we emailed you to activate your account."
      }
    >
      {checking ? (
        <div className="flex items-center justify-center py-6">
          <Spinner className="h-6 w-6 text-primary" />
        </div>
      ) : verified ? (
        <div className="space-y-5">
          <div className="rounded-xl border border-success/30 bg-success/10 p-5 text-center">
            <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-success/15 text-success">
              <CheckCircle2 className="h-7 w-7" />
            </span>
            <p className="mt-4 text-sm font-medium text-foreground">
              You're all set. Let's finish setting up your business.
            </p>
          </div>
          <Button className="h-11 w-full" onClick={handleContinue}>
            Continue
          </Button>
        </div>
      ) : (
        <div className="space-y-5">
          <p className="rounded-xl border border-border bg-surface p-5 text-sm text-muted-foreground">
            We couldn't confirm a verified session. The link may have expired — try signing in
            again, or request a new confirmation email by registering with the same address.
          </p>
          <Button asChild className="h-11 w-full">
            <Link to="/login">Go to sign in</Link>
          </Button>
        </div>
      )}
    </AuthLayout>
  );
}
