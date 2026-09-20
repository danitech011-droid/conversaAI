import { createFileRoute } from "@tanstack/react-router";
import { MessageSquare } from "lucide-react";

import { ComingSoon } from "@/components/dashboard/ComingSoon";

export const Route = createFileRoute("/_authenticated/conversations")({
  head: () => ({
    meta: [
      { title: "Conversations — ConversaAI" },
      { name: "description", content: "Live conversation inbox for your AI assistant." },
      { property: "og:title", content: "Conversations — ConversaAI" },
      { property: "og:description", content: "Live inbox — coming soon." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <ComingSoon
      icon={MessageSquare}
      title="Conversations"
      description="A live inbox for every chat your assistant handles across channels lands in a future sprint."
    />
  ),
});
