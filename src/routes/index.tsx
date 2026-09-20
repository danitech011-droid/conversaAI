import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  Clock3,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";

import { LogoLockup } from "@/components/brand/Logo";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ConversaAI — AI Customer Engagement Platform" },
      {
        name: "description",
        content:
          "Automate customer conversations across your website, WhatsApp and digital channels with ConversaAI. Your business never sleeps.",
      },
      { property: "og:title", content: "ConversaAI — Your Business Never Sleeps" },
      {
        property: "og:description",
        content: "AI-powered customer engagement across every channel your customers use.",
      },
    ],
  }),
  component: HomePage,
});

const PILLARS = [
  {
    icon: MessageSquareText,
    title: "One brain across every channel",
    body: "Website chat, WhatsApp, and more — answered with the same knowledge, tone, and brand voice.",
  },
  {
    icon: Clock3,
    title: "Always-on coverage",
    body: "Customers get accurate answers at 3am, on holidays, and during your busiest launch week.",
  },
  {
    icon: ShieldCheck,
    title: "Built for trust",
    body: "Secure authentication, scoped access, and full control over what your assistant can say.",
  },
] as const;

const STEPS = [
  {
    step: "01",
    title: "Create your workspace",
    body: "Sign up in minutes and invite your team with secure access.",
  },
  {
    step: "02",
    title: "Teach it your business",
    body: "Add products, FAQs, policies, and brand voice through guided onboarding.",
  },
  {
    step: "03",
    title: "Go live everywhere",
    body: "Deploy one assistant across the channels your customers already use.",
  },
] as const;

const CAPABILITIES = [
  "Guided business onboarding",
  "Brand colors and logo applied everywhere",
  "Knowledge base for accurate answers",
  "Secure sign-in for your whole team",
  "Conversation routing when humans are needed",
  "Ready for WhatsApp and web chat",
] as const;

function HomePage() {
  return (
    <PublicLayout>
      {/* Hero — one composition */}
      <section className="relative isolate overflow-hidden">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute inset-0 bg-grid-subtle opacity-60" />
          <div className="absolute -left-24 top-10 h-72 w-72 animate-float-slow rounded-full bg-cyan/15 blur-3xl" />
          <div className="absolute -right-16 top-32 h-80 w-80 animate-float-delayed rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
        </div>

        <div className="relative mx-auto grid w-full max-w-6xl gap-12 px-4 pb-16 pt-14 sm:px-6 sm:pb-24 sm:pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
          <div className="max-w-xl">
            <div className="animate-fade-in">
              <LogoLockup className="mb-8 h-9 sm:h-10" />
            </div>
            <h1 className="animate-slide-up text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-[3.5rem]">
              Customer conversations that{" "}
              <span className="text-gradient-brand">never sleep</span>
            </h1>
            <p
              className="mt-5 max-w-lg animate-slide-up text-base leading-relaxed text-foreground/70 sm:text-lg"
              style={{ animationDelay: "80ms" }}
            >
              ConversaAI answers, qualifies, and routes messages across your website, WhatsApp, and
              digital channels — so your team wakes up to progress, not a backlog.
            </p>
            <div
              className="mt-8 flex animate-slide-up flex-col gap-3 sm:flex-row sm:items-center"
              style={{ animationDelay: "140ms" }}
            >
              <Button asChild size="lg" className="h-12 px-6 shadow-[var(--shadow-card)]">
                <Link to="/register">
                  Start free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-6">
                <Link to="/features">See how it works</Link>
              </Button>
            </div>
            <p
              className="mt-4 animate-fade-in text-xs text-muted-foreground"
              style={{ animationDelay: "220ms" }}
            >
              Free to start · No credit card required
            </p>
          </div>

          <div
            className="relative animate-slide-up"
            style={{ animationDelay: "180ms" }}
            aria-hidden
          >
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-primary/20 via-cyan/10 to-transparent blur-2xl" />
            <HeroConversationPreview />
          </div>
        </div>
      </section>

      {/* Pillars — one job */}
      <section className="border-t border-border/80 bg-surface/60">
        <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium text-cyan">Why teams choose ConversaAI</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Premium customer engagement, without the complexity
            </h2>
          </div>
          <div className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
            {PILLARS.map((item, index) => (
              <article
                key={item.title}
                className="group animate-fade-in"
                style={{ animationDelay: `${index * 90}ms` }}
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-card text-primary shadow-[var(--shadow-soft)] transition-transform duration-300 group-hover:-translate-y-1">
                  <item.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-lg font-semibold tracking-tight text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border/80">
        <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-xl">
              <p className="text-sm font-medium text-primary">How it works</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Live in minutes, not quarters
              </h2>
              <p className="mt-3 text-base text-muted-foreground">
                A calm, guided path from account creation to a working assistant.
              </p>
            </div>
            <Button asChild variant="outline" className="w-fit">
              <Link to="/register">
                Begin onboarding
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <ol className="mt-14 grid gap-6 md:grid-cols-3">
            {STEPS.map((item, index) => (
              <li
                key={item.step}
                className={cn(
                  "relative rounded-2xl border border-border/80 bg-card/70 p-6 shadow-[var(--shadow-soft)]",
                  "transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-card)]",
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <span className="font-mono text-xs font-semibold tracking-[0.2em] text-cyan">
                  {item.step}
                </span>
                <h3 className="mt-4 text-lg font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Product depth */}
      <section className="border-t border-border/80 bg-navy text-navy-foreground">
        <div className="mx-auto grid w-full max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-cyan">
              <Workflow className="h-3.5 w-3.5" />
              Built for modern support teams
            </div>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
              Everything your assistant needs to sound like your business
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-300">
              From brand identity to knowledge, ConversaAI is designed to feel intentional —
              trustworthy, simple, and ready for real customers.
            </p>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {CAPABILITIES.map((line) => (
                <li key={line} className="flex items-start gap-2.5 text-sm text-slate-200">
                  <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan/15 text-cyan">
                    <Check className="h-3 w-3" />
                  </span>
                  {line}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 rounded-[2rem] bg-cyan/10 blur-3xl" aria-hidden />
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950/60 p-6 shadow-[var(--shadow-elevated)] backdrop-blur-xl sm:p-8">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  <p className="text-sm font-medium text-white">Assistant online</p>
                </div>
                <Sparkles className="h-4 w-4 text-cyan" />
              </div>
              <div className="mt-6 space-y-4">
                <MetricRow label="Median reply time" value="1.2s" bar="w-[92%]" />
                <MetricRow label="Resolved without an agent" value="78%" bar="w-[78%]" />
                <MetricRow label="Channels covered" value="Web · WhatsApp" bar="w-[64%]" />
              </div>
              <p className="mt-6 text-xs text-slate-400">
                Illustrative product metrics for the experience preview.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-border/80">
        <div className="relative mx-auto w-full max-w-6xl overflow-hidden px-4 py-20 sm:px-6">
          <div
            className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/10 via-transparent to-cyan/10"
            aria-hidden
          />
          <div className="relative mx-auto max-w-2xl rounded-3xl border border-border bg-card/80 px-6 py-12 text-center shadow-[var(--shadow-elevated)] backdrop-blur-sm sm:px-10">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Your business never sleeps. Neither should your support.
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-base text-muted-foreground">
              Create your ConversaAI workspace and put a polished assistant to work across every
              customer channel.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-12 px-7">
                <Link to="/register">
                  Create your account
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="h-12 px-7">
                <Link to="/pricing">View pricing</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

function MetricRow({
  label,
  value,
  bar,
}: {
  label: string;
  value: string;
  bar: string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
        <span className="text-slate-300">{label}</span>
        <span className="font-medium text-white">{value}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className={cn(
            "h-full rounded-full bg-gradient-to-r from-primary to-cyan animate-grow-bar",
            bar,
          )}
        />
      </div>
    </div>
  );
}

function HeroConversationPreview() {
  return (
    <div className="relative overflow-hidden rounded-[1.75rem] border border-border/80 bg-card/90 shadow-[var(--shadow-elevated)] backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-border/80 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-cyan text-xs font-bold text-white">
            AI
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card bg-emerald-400" />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">ConversaAI Assistant</p>
            <p className="text-xs text-muted-foreground">Responding in real time</p>
          </div>
        </div>
        <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
          Online
        </span>
      </div>

      <div className="space-y-3 px-5 py-5">
        <ChatBubble
          side="customer"
          delay="0ms"
          text="Do you ship to Dubai on weekends?"
        />
        <ChatBubble
          side="assistant"
          delay="180ms"
          text="Yes — orders placed before 6pm GST ship the same day, including Saturdays. Want me to check your cart’s delivery estimate?"
        />
        <ChatBubble side="customer" delay="320ms" text="Please do." />
        <div
          className="animate-fade-in rounded-2xl border border-border/70 bg-surface/80 px-4 py-3"
          style={{ animationDelay: "480ms" }}
        >
          <p className="text-xs font-medium text-cyan">Delivery estimate</p>
          <p className="mt-1 text-sm text-foreground">
            Arrives Sunday, 10–2pm · Free express for orders over $80
          </p>
        </div>
      </div>

      <div className="border-t border-border/80 px-5 py-3 text-xs text-muted-foreground">
        Answered in 1.2s · Handled without an agent
      </div>
    </div>
  );
}

function ChatBubble({
  side,
  text,
  delay,
}: {
  side: "customer" | "assistant";
  text: string;
  delay: string;
}) {
  const isCustomer = side === "customer";
  return (
    <p
      className={cn(
        "animate-chat-in max-w-[88%] px-4 py-2.5 text-sm leading-relaxed",
        isCustomer
          ? "ml-auto rounded-2xl rounded-br-md bg-primary text-primary-foreground"
          : "rounded-2xl rounded-bl-md bg-secondary text-secondary-foreground",
      )}
      style={{ animationDelay: delay }}
    >
      {text}
    </p>
  );
}
