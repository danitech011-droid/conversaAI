import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BarChart3,
  BookOpen,
  Languages,
  MessageCircle,
  PhoneCall,
  Puzzle,
  ShieldCheck,
  Workflow,
} from "lucide-react";

import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "Features — ConversaAI" },
      {
        name: "description",
        content:
          "See how ConversaAI automates customer conversations: omnichannel inbox, WhatsApp, knowledge grounding, handoff and insights.",
      },
      { property: "og:title", content: "Features — ConversaAI" },
      {
        property: "og:description",
        content: "Omnichannel AI conversations, knowledge grounding, human handoff and insights.",
      },
    ],
  }),
  component: FeaturesPage,
});

const FEATURES = [
  {
    icon: MessageCircle,
    title: "Website assistant",
    body: "An embeddable assistant that matches your brand and answers in your tone of voice.",
  },
  {
    icon: PhoneCall,
    title: "WhatsApp automation",
    body: "Meet customers on the channel they already use, with conversations that feel human.",
  },
  {
    icon: BookOpen,
    title: "Knowledge grounding",
    body: "Answers grounded in your policies, catalogue and FAQs — not guesswork.",
  },
  {
    icon: Workflow,
    title: "Smart handoff",
    body: "Escalate to a teammate with full context the moment a conversation needs a person.",
  },
  {
    icon: Languages,
    title: "Multilingual by default",
    body: "Reply in your customer's language without maintaining separate scripts.",
  },
  {
    icon: BarChart3,
    title: "Conversation insights",
    body: "Understand what customers ask most and where your experience leaks revenue.",
  },
  {
    icon: Puzzle,
    title: "Fits your stack",
    body: "Designed to connect with the tools your support and sales teams already run on.",
  },
  {
    icon: ShieldCheck,
    title: "Secure by design",
    body: "Scoped access, protected routes and data that stays under your control.",
  },
];

function FeaturesPage() {
  return (
    <PublicLayout>
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Everything you need to answer customers well
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            ConversaAI is built for teams that care about the quality of every reply — fast,
            accurate and unmistakably on-brand.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <article
              key={feature.title}
              className="surface-panel animate-fade-in p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)]"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <feature.icon className="h-5 w-5" />
              </span>
              <h2 className="mt-4 text-base font-semibold text-foreground">{feature.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.body}</p>
            </article>
          ))}
        </div>

        <div className="relative mt-14 overflow-hidden rounded-2xl border border-primary/25 bg-navy px-6 py-10 text-navy-foreground shadow-[var(--shadow-elevated)] sm:px-10">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-primary/30 blur-3xl"
          />
          <h2 className="relative text-2xl font-semibold tracking-tight">Ready to see it on your site?</h2>
          <p className="relative mt-2 max-w-xl text-sm text-navy-foreground/75">
            Create your account and complete a short onboarding — we'll shape ConversaAI around your
            business.
          </p>
          <Button
            asChild
            className="relative mt-6 h-11 bg-navy-foreground text-navy hover:bg-navy-foreground/90"
          >
            <Link to="/register">Create account</Link>
          </Button>
        </div>
      </section>
    </PublicLayout>
  );
}
