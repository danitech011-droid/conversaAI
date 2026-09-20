import { createFileRoute } from "@tanstack/react-router";
import { BarChart3 } from "lucide-react";

import { ComingSoon } from "@/components/dashboard/ComingSoon";

export const Route = createFileRoute("/_authenticated/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — ConversaAI" },
      { name: "description", content: "Conversation and knowledge analytics for your assistant." },
      { property: "og:title", content: "Analytics — ConversaAI" },
      { property: "og:description", content: "Assistant analytics — coming soon." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <ComingSoon
      icon={BarChart3}
      title="Analytics"
      description="Response quality, busiest hours and knowledge gaps will be charted here in a future sprint."
    />
  ),
});
