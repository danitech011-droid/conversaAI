import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { PasswordField, TextField } from "@/components/form/Fields";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { supabase } from "@/integrations/supabase/client";
import { friendlyAuthError } from "@/lib/auth-helpers";

export const Route = createFileRoute("/admin-login")({
  head: () => ({
    meta: [
      { title: "Admin access — ConversaAI" },
      { name: "description", content: "Sign in to the ConversaAI admin workspace." },
    ],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!email || password.length < 8 || (mode === "signup" && !fullName.trim())) {
      toast.error(mode === "login" ? "Enter a valid email and password" : "Complete all fields to create an account");
      return;
    }

    setLoading(true);
    const result = mode === "login"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName.trim() } } });

    if (result.error) {
      setLoading(false);
      toast.error("Unable to continue", { description: friendlyAuthError(result.error.message) });
      return;
    }

    if (!result.data.session) {
      setLoading(false);
      toast.success("Check your email", { description: "Confirm your account, then return here to sign in." });
      setMode("login");
      return;
    }

    const { data: isAdmin, error: claimError } = await supabase.rpc("claim_first_admin");
    if (claimError || !isAdmin) {
      await supabase.auth.signOut();
      setLoading(false);
      toast.error("Admin access is restricted", { description: "Only the first account created for this workspace can enter the admin dashboard." });
      return;
    }

    navigate({ to: "/admin", replace: true });
  }

  return (
    <AuthLayout
      title={mode === "login" ? "Admin access" : "Create the admin account"}
      description={mode === "login" ? "Sign in to manage leads and website activity." : "The first account created receives admin access."}
      footer={<Link to="/" className="font-medium text-primary hover:underline">Back to ConversaAI</Link>}
    >
      <div className="mb-6 flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
        <LockKeyhole className="h-5 w-5 shrink-0 text-primary" />
        <span>Private workspace for website operations and lead management.</span>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "signup" ? <TextField label="Full name" value={fullName} onChange={(event) => setFullName(event.target.value)} autoComplete="name" placeholder="Your name" /> : null}
        <TextField label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" placeholder="you@company.com" />
        <PasswordField label="Password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === "login" ? "current-password" : "new-password"} placeholder="••••••••" />
        <Button type="submit" className="h-11 w-full" disabled={loading}>{loading ? <Spinner className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}{mode === "login" ? "Sign in to admin" : "Create admin account"}</Button>
      </form>
      <button type="button" className="mt-6 w-full text-center text-sm text-muted-foreground hover:text-foreground" onClick={() => setMode(mode === "login" ? "signup" : "login")}>
        {mode === "login" ? "First time here? Create the admin account" : "Already have an account? Sign in"}
      </button>
    </AuthLayout>
  );
}
