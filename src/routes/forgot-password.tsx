import { createFileRoute, Link } from "@tanstack/react-router";
import { MailCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { TextField } from "@/components/form/Fields";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { supabase } from "@/integrations/supabase/client";
import { friendlyAuthError } from "@/lib/auth-helpers";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset your password — ConversaAI" },
      { name: "description", content: "Request a password reset link for your ConversaAI account." },
      { property: "og:title", content: "Reset your password — ConversaAI" },
      { property: "og:description", content: "We'll email you a secure reset link." },
    ],
  }),
  component: ForgotPasswordPage,
});

const schema = z.object({ email: z.string().trim().email("Enter a valid email address").max(255) });

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = schema.safeParse({ email });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message);
      return;
    }
    setError(undefined);
    setLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

    if (resetError) {
      toast.error("Couldn't send reset link", {
        description: friendlyAuthError(resetError.message),
      });
      return;
    }

    setSent(true);
    toast.success("Reset link sent", { description: "Check your inbox for the next step." });
  }

  return (
    <AuthLayout
      title="Forgot your password?"
      description="Enter your email and we'll send you a secure reset link."
      footer={
        <>
          Remembered it?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Back to sign in
          </Link>
        </>
      }
    >
      {sent ? (
        <div className="rounded-xl border border-border bg-surface p-5 text-center">
          <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <MailCheck className="h-6 w-6" />
          </span>
          <p className="mt-4 text-sm text-foreground">
            If an account exists for <span className="font-medium">{email}</span>, a reset link is
            on its way.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error}
            placeholder="you@company.com"
          />
          <Button type="submit" className="h-11 w-full" disabled={loading}>
            {loading ? <Spinner className="h-4 w-4" /> : null}
            Send reset link
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
