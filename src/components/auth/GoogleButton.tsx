import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { supabase } from "@/integrations/supabase/client";
import { friendlyAuthError, oauthCallbackUrl, readAuthorizeError } from "@/lib/auth-helpers";

export function GoogleButton({ label = "Continue with Google" }: { label?: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function fail(message: string) {
    const description = friendlyAuthError(message);
    setError(description);
    toast.error("Google sign-in failed", { description, duration: 8000 });
    setLoading(false);
  }

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: oauthCallbackUrl(),
          skipBrowserRedirect: true,
          queryParams: {
            access_type: "offline",
            prompt: "select_account",
          },
        },
      });

      if (oauthError) {
        fail(oauthError.message);
        return;
      }

      if (!data.url) {
        fail("Could not start Google sign-in. Please try again.");
        return;
      }

      const authorizeError = await readAuthorizeError(data.url);
      if (authorizeError) {
        fail(authorizeError);
        return;
      }

      window.location.assign(data.url);
    } catch (caught) {
      fail(caught instanceof Error ? caught.message : "Please try again.");
    }
  }

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="outline"
        className="h-11 w-full gap-2.5"
        onClick={handleClick}
        disabled={loading}
      >
        {loading ? <Spinner className="h-4 w-4" /> : <GoogleIcon />}
        {label}
      </Button>
      {error ? (
        <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.63h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.58-5.17 3.58-8.8Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.08 7.94-2.93l-3.88-3c-1.08.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.95H1.28v3.09A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.29 14.27a7.2 7.2 0 0 1 0-4.54v-3.1H1.28a12 12 0 0 0 0 10.73l4.01-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.76 0 3.34.61 4.59 1.8l3.43-3.43C17.95 1.18 15.23 0 12 0A12 12 0 0 0 1.28 6.63l4.01 3.1C6.23 6.88 8.88 4.75 12 4.75Z"
      />
    </svg>
  );
}
