import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { PasswordField, TextField } from "@/components/form/Fields";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Spinner } from "@/components/ui/spinner";
import { supabase } from "@/integrations/supabase/client";
import { friendlyAuthError, resolvePostLoginPath } from "@/lib/auth-helpers";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create your account — ConversaAI" },
      {
        name: "description",
        content: "Create a ConversaAI account and start automating customer conversations.",
      },
      { property: "og:title", content: "Create your account — ConversaAI" },
      { property: "og:description", content: "Start automating customer conversations today." },
    ],
  }),
  component: RegisterPage,
});

const schema = z
  .object({
    fullName: z.string().trim().min(2, "Enter your full name").max(100, "Name is too long"),
    email: z.string().trim().email("Enter a valid business email").max(255),
    password: z
      .string()
      .min(8, "Use at least 8 characters")
      .max(72, "Password is too long")
      .regex(/[A-Za-z]/, "Include at least one letter")
      .regex(/[0-9]/, "Include at least one number"),
    confirmPassword: z.string(),
    terms: z.literal(true, {
      errorMap: () => ({ message: "Please accept the Terms and Privacy Policy" }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords don't match",
  });

function RegisterPage() {
  const navigate = useNavigate();
  const [values, setValues] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

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

    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        // Pre-launch: skip verify-email redirect UX; session is used when confirmations are off.
        data: { full_name: parsed.data.fullName },
      },
    });

    if (error) {
      setLoading(false);
      const msg = error.message.toLowerCase();
      if (msg.includes("over_email_send_rate_limit") || msg.includes("email rate limit")) {
        toast.error("Email send limit reached", {
          description:
            "Confirm email is still on, so each signup sends mail. In Supabase → Authentication → Providers → Email, turn off “Confirm email”, wait ~1 hour, then try again — or sign in if you already created an account.",
          duration: 14000,
        });
        return;
      }
      toast.error("Couldn't create your account", {
        description: friendlyAuthError(error.message),
      });
      return;
    }

    let userId = data.user?.id ?? null;
    let session = data.session;

    // Empty identities = Supabase anti-enumeration stub (email already registered).
    if (data.user && (data.user.identities?.length ?? 0) === 0) {
      setLoading(false);
      toast.error("An account with this email already exists", {
        description: "Try signing in instead, or use a different email.",
      });
      navigate({ to: "/login", replace: true });
      return;
    }

    // If Supabase didn't return a session (email confirm still on), try signing in immediately.
    if (!session) {
      const signedIn = await supabase.auth.signInWithPassword({
        email: parsed.data.email,
        password: parsed.data.password,
      });

      if (signedIn.error) {
        setLoading(false);
        const msg = signedIn.error.message.toLowerCase();
        if (msg.includes("email not confirmed") || msg.includes("invalid login credentials")) {
          toast.error("Email confirmation is still enabled", {
            description:
              "In the Cursor Supabase project → Authentication → Providers → Email, turn off “Confirm email”, then create the account again. We’ll re-enable it before launch.",
            duration: 12000,
          });
          return;
        }
        toast.error("Account created, but sign-in failed", {
          description: friendlyAuthError(signedIn.error.message),
        });
        return;
      }

      session = signedIn.data.session;
      userId = signedIn.data.user?.id ?? userId;
    }

    setLoading(false);

    if (!userId || !session) {
      toast.error("Couldn't finish sign-up", {
        description: "Please try signing in with the email and password you just created.",
      });
      navigate({ to: "/login", replace: true });
      return;
    }

    toast.success("Account created");
    const to = await resolvePostLoginPath(userId);
    navigate({ to, replace: true });
  }

  return (
    <AuthLayout
      title="Create your account"
      description="Set up ConversaAI for your business in a few minutes."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <TextField
          label="Full name"
          autoComplete="name"
          value={values.fullName}
          onChange={(e) => setValues((v) => ({ ...v, fullName: e.target.value }))}
          error={errors["fullName"]}
          placeholder="Amelia Rahman"
          maxLength={100}
        />
        <TextField
          label="Business email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
          error={errors["email"]}
          placeholder="you@company.com"
          maxLength={255}
        />
        <PasswordField
          label="Password"
          autoComplete="new-password"
          value={values.password}
          onChange={(e) => setValues((v) => ({ ...v, password: e.target.value }))}
          error={errors["password"]}
          hint="At least 8 characters, with a letter and a number."
          placeholder="••••••••"
        />
        <PasswordField
          label="Confirm password"
          autoComplete="new-password"
          value={values.confirmPassword}
          onChange={(e) => setValues((v) => ({ ...v, confirmPassword: e.target.value }))}
          error={errors["confirmPassword"]}
          placeholder="••••••••"
        />

        <div className="space-y-1.5">
          <div className="flex items-start gap-3">
            <Checkbox
              id="terms"
              checked={values.terms}
              onCheckedChange={(checked) => setValues((v) => ({ ...v, terms: checked === true }))}
              aria-invalid={Boolean(errors["terms"])}
              className="mt-0.5"
            />
            <label htmlFor="terms" className="text-sm leading-relaxed text-muted-foreground">
              I agree to the{" "}
              <span className="font-medium text-foreground">Terms</span> and{" "}
              <span className="font-medium text-foreground">Privacy Policy</span>.
            </label>
          </div>
          {errors["terms"] ? (
            <p className="text-xs font-medium text-destructive">{errors["terms"]}</p>
          ) : null}
        </div>

        <Button type="submit" className="h-11 w-full" disabled={loading}>
          {loading ? <Spinner className="h-4 w-4" /> : null}
          Create account
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs uppercase tracking-wide text-muted-foreground">or</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <GoogleButton label="Sign up with Google" />
    </AuthLayout>
  );
}
