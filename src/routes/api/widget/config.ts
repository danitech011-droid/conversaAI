import { createAPIFileRoute } from "@tanstack/react-start/api";

type WidgetConfig = {
  public_installation_id: string;
  agent_name: string;
  welcome_message: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  status: string;
  is_active: boolean;
};

function headers() {
  return {
    "access-control-allow-origin": "*",
    "cache-control": "no-store",
    "content-type": "application/json",
  };
}

export const APIRoute = createAPIFileRoute("/api/widget/config")({
  GET: async ({ request }) => {
    const installationId = new URL(request.url).searchParams.get("installation_id")?.trim();
    if (!installationId || !/^wi_[a-f0-9]{36}$/.test(installationId)) {
      return new Response(JSON.stringify({ error: "Invalid installation" }), {
        status: 400,
        headers: headers(),
      });
    }

    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data, error } = await supabaseAdmin.rpc("get_widget_config", {
        p_installation_id: installationId,
      });
      const config = (data?.[0] ?? null) as WidgetConfig | null;
      if (error || !config || !config.is_active || config.status !== "active") {
        return new Response(JSON.stringify({ error: "Installation unavailable" }), {
          status: 404,
          headers: headers(),
        });
      }

      await supabaseAdmin
        .from("website_installations")
        .update({ last_seen_at: new Date().toISOString() })
        .eq("public_installation_id", installationId);

      return new Response(JSON.stringify(config), { headers: headers() });
    } catch {
      return new Response(JSON.stringify({ error: "Installation unavailable" }), {
        status: 503,
        headers: headers(),
      });
    }
  },
});