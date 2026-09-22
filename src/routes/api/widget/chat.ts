import { createAPIFileRoute } from "@tanstack/react-start/api";

import { generateAssistantResponse } from "@/lib/ai/server-response";

const INSTALLATION_ID_RE = /^wi_[a-f0-9]{36}$/;
const VISITOR_ID_RE = /^vi_[a-f0-9]{36}$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_MESSAGE_LENGTH = 4000;

function responseHeaders() {
  return {
    "access-control-allow-headers": "content-type",
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-origin": "*",
    "cache-control": "no-store",
    "content-type": "application/json",
  };
}

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: responseHeaders() });
}

type ChatPayload = {
  installation_id?: unknown;
  visitor_id?: unknown;
  conversation_id?: unknown;
  message?: unknown;
};

export const APIRoute = createAPIFileRoute("/api/widget/chat")({
  OPTIONS: async () => new Response(null, { status: 204, headers: responseHeaders() }),
  POST: async ({ request }) => {
    try {
      const contentLength = Number(request.headers.get("content-length") ?? 0);
      if (contentLength > 16_000) return json({ success: false, code: "PAYLOAD_TOO_LARGE" }, 413);

      const payload = (await request.json()) as ChatPayload;
      const installationId = typeof payload.installation_id === "string" ? payload.installation_id.trim() : "";
      const visitorPublicId = typeof payload.visitor_id === "string" ? payload.visitor_id.trim() : "";
      const conversationId =
        typeof payload.conversation_id === "string" ? payload.conversation_id.trim() : "";
      const message = typeof payload.message === "string" ? payload.message.trim() : "";

      if (!INSTALLATION_ID_RE.test(installationId) || !VISITOR_ID_RE.test(visitorPublicId)) {
        return json({ success: false, code: "INVALID_REQUEST" }, 400);
      }
      if (conversationId && !UUID_RE.test(conversationId)) {
        return json({ success: false, code: "INVALID_REQUEST" }, 400);
      }
      if (!message || message.length > MAX_MESSAGE_LENGTH) {
        return json({ success: false, code: "INVALID_MESSAGE" }, 400);
      }

      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: installation, error: installationError } = await supabaseAdmin
        .from("website_installations")
        .select("id, owner_id, agent_id, status, is_active")
        .eq("public_installation_id", installationId)
        .maybeSingle();

      if (
        installationError ||
        !installation ||
        installation.status !== "active" ||
        !installation.is_active
      ) {
        return json({ success: false, code: "INSTALLATION_UNAVAILABLE" }, 404);
      }

      const now = new Date().toISOString();
      const { data: visitor, error: visitorError } = await supabaseAdmin
        .from("visitors")
        .upsert(
          {
            owner_id: installation.owner_id,
            installation_id: installation.id,
            visitor_public_id: visitorPublicId,
            last_seen_at: now,
          },
          { onConflict: "installation_id,visitor_public_id" },
        )
        .select("id, owner_id, installation_id")
        .single();

      if (visitorError || !visitor) return json({ success: false, code: "REQUEST_UNAVAILABLE" }, 503);

      let conversation: { id: string; owner_id: string; visitor_id: string } | null = null;
      if (conversationId) {
        const { data } = await supabaseAdmin
          .from("conversations")
          .select("id, owner_id, visitor_id")
          .eq("id", conversationId)
          .eq("owner_id", installation.owner_id)
          .eq("installation_id", installation.id)
          .eq("visitor_id", visitor.id)
          .eq("status", "open")
          .maybeSingle();
        conversation = data;
      }

      if (!conversation) {
        const { data } = await supabaseAdmin
          .from("conversations")
          .select("id, owner_id, visitor_id")
          .eq("owner_id", installation.owner_id)
          .eq("installation_id", installation.id)
          .eq("visitor_id", visitor.id)
          .eq("status", "open")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        conversation = data;
      }

      if (!conversation) {
        const { data, error } = await supabaseAdmin
          .from("conversations")
          .insert({
            owner_id: installation.owner_id,
            installation_id: installation.id,
            visitor_id: visitor.id,
            agent_id: installation.agent_id,
            channel: "website",
            status: "open",
            started_at: now,
            last_message_at: now,
          })
          .select("id, owner_id, visitor_id")
          .single();
        if (data) {
          conversation = data;
        } else {
          const { data: existing } = await supabaseAdmin
            .from("conversations")
            .select("id, owner_id, visitor_id")
            .eq("owner_id", installation.owner_id)
            .eq("installation_id", installation.id)
            .eq("visitor_id", visitor.id)
            .eq("status", "open")
            .maybeSingle();
          if (existing) conversation = existing;
          else if (error) return json({ success: false, code: "REQUEST_UNAVAILABLE" }, 503);
        }
      }

      const { data: userMessage, error: messageError } = await supabaseAdmin
        .from("messages")
        .insert({
          conversation_id: conversation.id,
          owner_id: installation.owner_id,
          role: "user",
          content: message,
          channel: "website",
          sender_type: "visitor",
        })
        .select("id, role, content, created_at")
        .single();
      if (messageError || !userMessage) return json({ success: false, code: "REQUEST_UNAVAILABLE" }, 503);

      await supabaseAdmin
        .from("conversations")
        .update({ last_message_at: now })
        .eq("id", conversation.id)
        .eq("owner_id", installation.owner_id);

      const { data: recentMessages } = await supabaseAdmin
        .from("messages")
        .select("role, content")
        .eq("conversation_id", conversation.id)
        .order("created_at", { ascending: false })
        .limit(20);
      const { data: user } = await supabaseAdmin.auth.admin.getUserById(installation.owner_id);
      const assistantConfiguration = (user.user?.user_metadata?.["conversa_onboarding"] ?? {}) as Record<
        string,
        unknown
      >;
      const assistantResponse = await generateAssistantResponse({
        ownerId: installation.owner_id,
        installationId: installation.id,
        conversationId: conversation.id,
        recentMessages: (recentMessages ?? []).reverse(),
        assistantConfiguration,
        knowledgeContext: [],
      });

      if (!assistantResponse.connected) {
        return json({
          success: false,
          code: assistantResponse.code,
          conversation_id: conversation.id,
          user_message_id: userMessage.id,
          message: assistantResponse.message,
        }, 503);
      }

      const { data: assistantMessage, error: assistantMessageError } = await supabaseAdmin
        .from("messages")
        .insert({
          conversation_id: conversation.id,
          owner_id: installation.owner_id,
          role: "assistant",
          content: assistantResponse.content,
          channel: "website",
          sender_type: "AI",
          metadata: (assistantResponse.metadata ?? {}) as never,
        })
        .select("id, role, content, created_at")
        .single();
      if (assistantMessageError || !assistantMessage) return json({ success: false, code: "REQUEST_UNAVAILABLE" }, 503);

      await supabaseAdmin.from("conversations").update({ last_message_at: new Date().toISOString() }).eq("id", conversation.id);
      return json({ success: true, conversation_id: conversation.id, message: assistantMessage });
    } catch {
      return json({ success: false, code: "REQUEST_UNAVAILABLE" }, 503);
    }
  },
});