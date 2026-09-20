import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { PasswordField, TextField } from "@/components/form/Fields";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { friendlyAuthError, resolvePostLoginPath } from "@/lib/auth-helpers";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — ConversaAI" },
      { name: "description", content: "Sign in to your ConversaAI workspace." },
      { property: "og:title", content: "Sign in — ConversaAI" },
      { property: "og:description", content: "Access your ConversaAI workspace." },
    ],
  }),
  component: LoginPage,
});

const schema = z.object({
  email: z.string().trim().email("Enter a valid email address").max(255),
  password: z.string().min(1, "Enter your password"),
});

function LoginPage() {
  const navigate = useNavigate();
  const { user, loading: sessionLoading } = useAuth();
  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!sessionLoading && user) {
      resolvePostLoginPath(user.id).then((to) => navigate({ to, replace: true }));
    }
  }, [user, sessionLoading, navigate]);

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

    const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

    if (error) {
      setLoading(false);
      toast.error("Couldn't sign you in", { description: friendlyAuthError(error.message) });
      return;
    }

    toast.success("Welcome back");
    const to = await resolvePostLoginPath(data.user.id);
    navigate({ to, replace: true });
  }

  return (
    <AuthLayout
      title="Sign in"
      description="Welcome back. Pick up where your customers left off."
      footer={
        <>
          Don't have an account?{" "}
          <Link to="/register" className="font-medium text-primary hover:underline">
            Create account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
          error={errors["email"]}
          placeholder="you@company.com"
        />
        <div>
          <PasswordField
            label="Password"
            autoComplete="current-password"
            value={values.password}
            onChange={(e) => setValues((v) => ({ ...v, password: e.target.value }))}
            error={errors["password"]}
            placeholder="••••••••"
          />
          <div className="mt-2 text-right">
            <Link
              to="/forgot-password"
              className="text-sm font-medium text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <Button type="submit" className="h-11 w-full" disabled={loading}>
          {loading ? <Spinner className="h-4 w-4" /> : null}
          Sign in
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs uppercase tracking-wide text-muted-foreground">or</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <GoogleButton />
    </AuthLayout>
  );
}
