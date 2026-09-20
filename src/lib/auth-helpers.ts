import { supabase } from "@/integrations/supabase/client";

/** Human-friendly copy for the auth errors users actually hit. */
export function friendlyAuthError(message: string): string {
  const normalized = message.toLowerCase();
  if (normalized.includes("invalid login credentials")) {
    return "That email and password combination doesn't match our records.";
  }
  if (normalized.includes("email not confirmed")) {
    return "Please confirm your email address before signing in.";
  }
  if (normalized.includes("user already registered")) {
    return "An account with this email already exists. Try signing in instead.";
  }
  if (normalized.includes("rate limit") || normalized.includes("too many")) {
    return "Too many attempts. Please wait a moment and try again.";
  }
  if (
    normalized.includes("over_email_send_rate_limit") ||
    normalized.includes("email rate limit")
  ) {
    return "Supabase stopped sending confirmation emails because the limit was hit. Turn off Confirm email in Authentication → Providers → Email, wait about an hour, then try again.";
  }
  if (
    normalized.includes("unsupported provider") ||
    normalized.includes("provider is not enabled") ||
    normalized.includes("missing oauth secret")
  ) {
    return "Google sign-in isn't configured yet. In the Supabase dashboard, open Authentication → Providers → Google, add your Google Client ID and Client Secret, then try again.";
  }
  if (normalized.includes("redirect") && normalized.includes("not allowed")) {
    return "This site isn’t on the allowed redirect list. Add this origin in Supabase Auth URL configuration.";
  }
  if (normalized.includes("popup")) {
    return "The Google window was blocked. Allow popups for this site, or try again.";
  }
  return message;
}

export function oauthCallbackUrl(): string {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/auth/callback`;
}

/** Probe the authorize URL so a missing Google secret shows a toast instead of raw JSON. */
export async function readAuthorizeError(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, { redirect: "manual", headers: { Accept: "application/json" } });
    if (response.type === "opaqueredirect" || response.status === 0 || response.status < 400) {
      return null;
    }
    const body = (await response.json()) as { msg?: string; error_description?: string; message?: string };
    return body.msg || body.error_description || body.message || `Google sign-in failed (${response.status})`;
  } catch {
    return null;
  }
}

export async function signOutCleanly() {
  await supabase.auth.signOut();
}

/** Where a signed-in user belongs: onboarding until the profile is complete. */
export async function resolvePostLoginPath(userId: string): Promise<"/onboarding" | "/dashboard"> {
  const { data } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", userId)
    .maybeSingle();

  return data?.onboarding_completed ? "/dashboard" : "/onboarding";
}

function oauthErrorFromUrl(): string | null {
  const search = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  return (
    search.get("error_description") ||
    search.get("error") ||
    hash.get("error_description") ||
    hash.get("error")
  );
}

/** Completes a Google (or other OAuth) return and sends the user to the right place. */
export async function completeOAuthRedirect(): Promise<
  { ok: true; to: "/onboarding" | "/dashboard" } | { ok: false; message: string }
> {
  const urlError = oauthErrorFromUrl();
  if (urlError) {
    return { ok: false, message: friendlyAuthError(urlError) };
  }

  const { data: existing } = await supabase.auth.getSession();
  if (existing.session?.user) {
    const to = await resolvePostLoginPath(existing.session.user.id);
    return { ok: true, to };
  }

  const code = new URLSearchParams(window.location.search).get("code");
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error && !/already been used|code verifier/i.test(error.message)) {
      return { ok: false, message: friendlyAuthError(error.message) };
    }
  }

  const { data } = await supabase.auth.getSession();
  if (!data.session?.user) {
    return {
      ok: false,
      message: "Google sign-in didn't complete. Please try again.",
    };
  }

  const to = await resolvePostLoginPath(data.session.user.id);
  return { ok: true, to };
}
