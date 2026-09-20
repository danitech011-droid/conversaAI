import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";

import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — ConversaAI" },
      {
        name: "description",
        content:
          "Simple ConversaAI pricing: start free, scale with Growth, or go bespoke with Enterprise support.",
      },
      { property: "og:title", content: "Pricing — ConversaAI" },
      {
        property: "og:description",
        content: "Start free and scale your AI customer engagement as your conversations grow.",
      },
    ],
  }),
  component: PricingPage,
});

const PLANS = [
  {
    name: "Starter",
    price: "$0",
    cadence: "forever",
    blurb: "For small teams testing automated conversations.",
    features: ["500 conversations / month", "Website assistant", "Email support", "1 team member"],
    highlighted: false,
  },
  {
    name: "Growth",
    price: "$149",
    cadence: "per month",
    blurb: "For businesses running customer support at scale.",
    features: [
      "10,000 conversations / month",
      "WhatsApp + website channels",
      "Knowledge grounding",
      "Human handoff & routing",
      "10 team members",
    ],
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    cadence: "talk to us",
    blurb: "For organisations with compliance and volume needs.",
    features: [
      "Unlimited conversations",
      "Dedicated success manager",
      "Custom integrations",
      "Advanced security review",
    ],
    highlighted: false,
  },
];

function PricingPage() {
  return (
    <PublicLayout>
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Pricing that grows with your conversations
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Start free. Upgrade when your customers start noticing how fast you reply.
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <article
              key={plan.name}
              className={cn(
                "flex animate-fade-in flex-col rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)] sm:p-8",
                plan.highlighted && "border-primary/40 shadow-[var(--shadow-elevated)] lg:-mt-4",
              )}
            >
              {plan.highlighted ? (
                <span className="mb-4 w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  Most popular
                </span>
              ) : null}
              <h2 className="text-lg font-semibold text-foreground">{plan.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{plan.blurb}</p>
              <p className="mt-6 flex items-baseline gap-2">
                <span className="text-4xl font-bold tracking-tight text-foreground">
                  {plan.price}
                </span>
                <span className="text-sm text-muted-foreground">{plan.cadence}</span>
              </p>
              <ul className="mt-6 flex-1 space-y-3 text-sm text-muted-foreground">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                asChild
                variant={plan.highlighted ? "default" : "outline"}
                className="mt-8 h-11"
              >
                <Link to={plan.name === "Enterprise" ? "/contact" : "/register"}>
                  {plan.name === "Enterprise" ? "Contact sales" : "Get started"}
                </Link>
              </Button>
            </article>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
