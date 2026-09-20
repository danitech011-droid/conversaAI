import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { PasswordField } from "@/components/form/Fields";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { supabase } from "@/integrations/supabase/client";
import { friendlyAuthError } from "@/lib/auth-helpers";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a new password — ConversaAI" },
      { name: "description", content: "Choose a new password for your ConversaAI account." },
      { property: "og:title", content: "Set a new password — ConversaAI" },
      { property: "og:description", content: "Choose a new password to secure your account." },
    ],
  }),
  component: ResetPasswordPage,
});

const schema = z
  .object({
    password: z
      .string()
      .min(8, "Use at least 8 characters")
      .max(72, "Password is too long")
      .regex(/[A-Za-z]/, "Include at least one letter")
      .regex(/[0-9]/, "Include at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords don't match",
  });

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [values, setValues] = useState({ password: "", confirmPassword: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [linkValid, setLinkValid] = useState(true);

  useEffect(() => {
    // Supabase parses the recovery link and establishes a temporary session.
    const { data: subscription } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setLinkValid(true);
        setReady(true);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      setLinkValid(Boolean(data.session));
      setReady(true);
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      setErrors(
        Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])),
      );
      return;
    }
    setErrors({});
    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
    setLoading(false);

    if (error) {
      toast.error("Couldn't update your password", {
        description: friendlyAuthError(error.message),
      });
      return;
    }

    toast.success("Password updated", { description: "You can now sign in with your new password." });
    navigate({ to: "/dashboard", replace: true });
  }

  return (
    <AuthLayout
      title="Set a new password"
      description="Choose a strong password you haven't used before."
      footer={
        <Link to="/login" className="font-medium text-primary hover:underline">
          Back to sign in
        </Link>
      }
    >
      {ready && !linkValid ? (
        <div className="rounded-xl border border-warning/40 bg-warning/10 p-4 text-sm text-foreground">
          This reset link is invalid or has expired. Request a new one from the{" "}
          <Link to="/forgot-password" className="font-medium text-primary hover:underline">
            forgot password
          </Link>{" "}
          page.
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <PasswordField
            label="New password"
            autoComplete="new-password"
            value={values.password}
            onChange={(e) => setValues((v) => ({ ...v, password: e.target.value }))}
            error={errors['password']}
            hint="At least 8 characters, with a letter and a number."
          />
          <PasswordField
            label="Confirm new password"
            autoComplete="new-password"
            value={values.confirmPassword}
            onChange={(e) => setValues((v) => ({ ...v, confirmPassword: e.target.value }))}
            error={errors['confirmPassword']}
          />
          <Button type="submit" className="h-11 w-full" disabled={loading || !ready}>
            {loading ? <Spinner className="h-4 w-4" /> : null}
            Update password
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
