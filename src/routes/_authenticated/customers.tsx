import { createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";

import { ComingSoon } from "@/components/dashboard/ComingSoon";

export const Route = createFileRoute("/_authenticated/customers")({
  head: () => ({
    meta: [
      { title: "Customers — ConversaAI" },
      { name: "description", content: "Customer profiles and history for your AI assistant." },
      { property: "og:title", content: "Customers — ConversaAI" },
      { property: "og:description", content: "Customer profiles — coming soon." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <ComingSoon
      icon={Users}
      title="Customers"
      description="Unified customer profiles with conversation history and preferences arrive in a future sprint."
    />
  ),
});
