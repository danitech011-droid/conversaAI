import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  Bot,
  Check,
  ChevronRight,
  Clock3,
  LayoutDashboard,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Target,
  WandSparkles,
  Zap,
} from "lucide-react";

import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ConversaAI - AI Customer Engagement" },
      {
        name: "description",
        content:
          "ConversaAI helps businesses respond instantly on their website and WhatsApp, 24/7.",
      },
    ],
  }),
  component: HomePage,
});

const INDUSTRIES = [
  "Real Estate",
  "Hotels",
  "Restaurants",
  "Hospitals",
  "Schools",
  "E-commerce",
  "Automotive",
  "Professional Services",
  "Logistics",
  "And more",
] as const;

const FEATURES = [
  {
    icon: Bot,
    title: "AI Website Assistant",
    body: "Helps visitors instantly, recommends products or services, answers questions, and captures leads.",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp AI Assistant",
    body: "Automatically replies to customer messages 24/7 while maintaining a natural and professional conversation.",
  },
  {
    icon: Target,
    title: "Lead Qualification",
    body: "Collects customer details, understands needs, and prepares qualified leads for business owners.",
  },
  {
    icon: WandSparkles,
    title: "AI Studio",
    body: "Customize your assistant without code - edit prompts, upload knowledge, and pick business templates.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    body: "Monitor conversations, customer engagement, AI activity, and business performance in real time.",
  },
] as const;

const STEPS = [
  ["01", "Create an account", "Sign up in seconds and get instant access to your workspace."],
  ["02", "Connect your business", "Link your website and WhatsApp number in a few clicks."],
  ["03", "Customize your AI", "Upload knowledge, pick a template, and shape your assistant's voice."],
  ["04", "Engage 24/7", "Let your AI answer, recommend, and qualify - day and night."],
] as const;

const WITHOUT = ["Slow replies", "Missed leads", "Limited business hours", "Repetitive customer questions"];
const WITH = ["Instant responses", "Better customer experience", "Qualified leads on autopilot", "24/7 availability"];

function HomePage() {
  return (
    <PublicLayout>
      <section className="relative isolate overflow-hidden border-b border-border/70">
        <div className="pointer-events-none absolute inset-0 bg-grid-subtle opacity-70" aria-hidden />
        <div className="pointer-events-none absolute -right-40 top-0 h-[32rem] w-[32rem] rounded-full bg-primary/15 blur-3xl" aria-hidden />
        <div className="relative mx-auto grid w-full max-w-6xl gap-14 px-4 pb-20 pt-16 sm:px-6 sm:pb-28 sm:pt-24 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-20">
          <div className="max-w-xl">
            <div className="animate-fade-in flex items-center gap-3 text-sm font-medium text-cyan">
              <span className="h-px w-8 bg-cyan" />
              New · AI Customer Engagement
            </div>
            <h1 className="mt-6 animate-slide-up text-5xl font-bold leading-[0.98] tracking-[-0.04em] text-foreground sm:text-6xl lg:text-7xl">
              AI That Helps Your Business <span className="text-gradient-brand">Never Sleep</span>
            </h1>
            <p className="mt-7 max-w-lg animate-slide-up text-lg leading-relaxed text-muted-foreground sm:text-xl" style={{ animationDelay: "80ms" }}>
              ConversaAI is an AI-powered customer engagement platform that helps businesses respond instantly on their website and WhatsApp - answering questions, recommending products, qualifying leads, and providing support 24/7.
            </p>
            <div className="mt-9 flex animate-slide-up flex-col gap-3 sm:flex-row" style={{ animationDelay: "140ms" }}>
              <Button asChild size="lg" className="h-13 px-6 shadow-[var(--shadow-card)]">
                <Link to="/register" className="w-full sm:w-auto">Get started <ArrowRight className="h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-13 px-6">
                <Link to="/login" className="w-full sm:w-auto">Sign in</Link>
              </Button>
            </div>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-muted-foreground">
              <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-cyan" />Enterprise-grade security</span>
              <span className="flex items-center gap-1.5"><Clock3 className="h-4 w-4 text-cyan" />Setup in minutes</span>
              <span className="flex items-center gap-1.5"><Zap className="h-4 w-4 text-cyan" />No code required</span>
            </div>
          </div>
          <HeroProductPreview />
        </div>
      </section>

      <section className="border-b border-border/70 bg-surface/60">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan">Every Industry</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground">Trusted for every business</h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">From storefronts to enterprises, ConversaAI adapts to how your industry talks with customers.</p>
          </div>
          <div className="flex flex-wrap gap-2 lg:justify-end">
            {INDUSTRIES.map((industry, index) => <IndustryChip key={industry} label={industry} featured={index === 0} />)}
          </div>
        </div>
      </section>

      <section className="border-b border-border/70" id="features">
        <div className="mx-auto w-full max-w-6xl px-4 py-24 sm:px-6">
          <SectionIntro eyebrow="Features" title="Everything you need to engage smarter" body="A complete AI stack purpose-built for customer conversations that convert." />
          <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature, index) => <FeatureCard key={feature.title} {...feature} featured={index === 0} />)}
          </div>
        </div>
      </section>

      <section className="border-b border-border/70 bg-surface/50" id="how-it-works">
        <div className="mx-auto w-full max-w-6xl px-4 py-24 sm:px-6">
          <SectionIntro eyebrow="How it works" title="Launch in four steps" body="Start with a smarter way to answer every customer, without adding another complicated tool to your stack." />
          <ol className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(([number, title, body]) => (
              <li key={number} className="group relative border-t-2 border-border pt-5 transition-colors hover:border-cyan">
                <span className="font-mono text-sm font-bold text-cyan">{number}</span>
                <h3 className="mt-6 text-lg font-semibold text-foreground">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
                <ChevronRight className="mt-7 h-4 w-4 text-border transition-transform group-hover:translate-x-1 group-hover:text-cyan" />
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-b border-border/70" id="product">
        <div className="mx-auto grid w-full max-w-6xl gap-14 px-4 py-24 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <SectionIntro eyebrow="Product" title="A closer look inside ConversaAI" body="Real screens from the product - designed for clarity, speed, and control." />
            <Button asChild variant="outline" className="mt-8"><Link to="/features">Explore the product <ArrowRight className="h-4 w-4" /></Link></Button>
          </div>
          <ProductDashboardPreview />
        </div>
      </section>

      <section className="border-b border-border/70 bg-navy text-navy-foreground">
        <div className="mx-auto grid w-full max-w-6xl gap-12 px-4 py-24 sm:px-6 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan">Why ConversaAI</p>
            <h2 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">The difference is night and day</h2>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-slate-300">Smarter customer engagement means faster answers, more qualified leads, and a team that can focus on the conversations that matter.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <ComparisonColumn title="Without ConversaAI" items={WITHOUT} muted />
            <ComparisonColumn title="With ConversaAI" items={WITH} />
          </div>
        </div>
      </section>

      <section className="border-b border-border/70">
        <div className="mx-auto w-full max-w-6xl px-4 py-24 sm:px-6">
          <div className="relative overflow-hidden rounded-[2rem] border border-border bg-card px-6 py-14 text-center shadow-[var(--shadow-elevated)] sm:px-12">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-cyan/10" aria-hidden />
            <div className="relative mx-auto max-w-2xl">
              <Sparkles className="mx-auto h-7 w-7 text-cyan" />
              <h2 className="mt-5 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Ready to transform your customer experience?</h2>
              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">Join businesses preparing for the future of customer engagement with ConversaAI.</p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><Button asChild size="lg"><Link to="/register">Get started <ArrowRight className="h-4 w-4" /></Link></Button><Button asChild size="lg" variant="outline"><Link to="/contact">Contact Us</Link></Button></div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface/50" id="contact">
        <div className="mx-auto grid w-full max-w-6xl gap-12 px-4 py-24 sm:px-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <SectionIntro eyebrow="Contact" title="Let's talk about your business" body="Tell us a little about you and we'll show you how ConversaAI fits into your customer workflow." />
            <div className="mt-8 space-y-4 text-sm text-muted-foreground">
              <ContactLine label="Email us" value="danitech011@gmail.com" />
              <ContactLine label="Chat on WhatsApp" value="+234 912 880 2572" />
              <ContactLine label="Response time" value="Within one business day" />
            </div>
          </div>
          <ContactFormPreview />
        </div>
      </section>
    </PublicLayout>
  );
}

function SectionIntro({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return <div className="max-w-2xl"><p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan">{eyebrow}</p><h2 className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">{title}</h2><p className="mt-4 text-base leading-relaxed text-muted-foreground">{body}</p></div>;
}

function IndustryChip({ label, featured }: { label: string; featured?: boolean }) {
  return <span className={cn("rounded-full border px-4 py-2 text-sm font-medium", featured ? "border-cyan/40 bg-cyan/10 text-cyan" : "border-border bg-card text-muted-foreground")}>{label}</span>;
}

function FeatureCard({ icon: Icon, title, body, featured }: (typeof FEATURES)[number] & { featured?: boolean }) {
  return <article className={cn("group rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-card)]", featured ? "border-primary/30 bg-primary/5" : "border-border bg-card")}><span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-cyan/10 text-cyan"><Icon className="h-5 w-5" /></span><h3 className="mt-6 text-lg font-semibold text-foreground">{title}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p><ArrowRight className="mt-6 h-4 w-4 text-border transition-transform group-hover:translate-x-1" /></article>;
}

function HeroProductPreview() {
  return <div className="relative"><div className="absolute -inset-8 rounded-[3rem] bg-primary/15 blur-3xl" aria-hidden /><div className="relative space-y-4"><MiniChat channel="yourbusiness.com" question="Hi! Looking for a 2-bed apartment downtown?" answer="Yes, budget around $1,800." result="Great - I found 3 matches. Want to book a viewing?" /><MiniChat channel="ConversaAI" question="Hello 👋 Do you deliver on Sundays?" answer="Yes! Between 10am - 6pm. Free over $30." result="Perfect. Can I order the family combo?" /></div></div>;
}

function MiniChat({ channel, question, answer, result }: { channel: string; question: string; answer: string; result: string }) {
  return <div className="overflow-hidden rounded-3xl border border-border/80 bg-card/95 shadow-[var(--shadow-elevated)] backdrop-blur-xl"><div className="flex items-center justify-between border-b border-border/70 px-5 py-4"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-xs font-bold text-primary-foreground">AI</div><div><p className="text-sm font-semibold text-foreground">{channel}</p><p className="text-xs text-muted-foreground">Online · replies instantly</p></div></div><span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /></div><div className="space-y-3 p-5"><p className="ml-auto max-w-[88%] rounded-2xl rounded-br-md bg-primary px-4 py-3 text-sm leading-relaxed text-primary-foreground">{question}</p><p className="max-w-[88%] rounded-2xl rounded-bl-md bg-secondary px-4 py-3 text-sm leading-relaxed text-secondary-foreground">{answer}</p><p className="max-w-[88%] rounded-2xl rounded-bl-md border border-cyan/20 bg-cyan/5 px-4 py-3 text-sm leading-relaxed text-foreground">{result}</p></div></div>;
}

function ProductDashboardPreview() {
  return <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-elevated)]"><div className="flex items-center justify-between border-b border-border px-5 py-4"><div className="flex items-center gap-2"><LayoutDashboard className="h-4 w-4 text-primary" /><span className="text-sm font-semibold text-foreground">Dashboard</span></div><span className="flex items-center gap-1.5 text-xs font-medium text-emerald-500"><span className="h-2 w-2 rounded-full bg-emerald-400" />Live</span></div><div className="grid gap-4 p-5 sm:grid-cols-3"><MetricCard label="Conversations" value="12,438+" change="18%" /><MetricCard label="Leads" value="1,204" change="32%" /><MetricCard label="Response" value="1.2s" change="-45%" /></div><div className="border-t border-border p-5"><div className="mb-4 flex items-center justify-between"><p className="text-sm font-semibold text-foreground">Live conversations</p><span className="text-xs text-muted-foreground">4 active</span></div><div className="space-y-3"><ConversationRow initials="SC" name="Sarah Chen" channel="Website" text="Do you have the pro plan monthly?" /><ConversationRow initials="AR" name="Ahmed R." channel="WhatsApp" text="Booking a table for 4 tonight" /><ConversationRow initials="LK" name="Lena K." channel="Website" text="Is the SUV available this weekend?" /><ConversationRow initials="MP" name="Marco P." channel="WhatsApp" text="Delivery to district 5?" /></div></div></div>;
}

function MetricCard({ label, value, change }: { label: string; value: string; change: string }) {
  return <div className="rounded-2xl border border-border bg-surface p-4"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-2 text-xl font-bold tracking-tight text-foreground">{value}</p><p className="mt-1 text-xs font-semibold text-emerald-500">{change}</p></div>;
}

function ConversationRow({ initials, name, channel, text }: { initials: string; name: string; channel: string; text: string }) {
  return <div className="flex items-center gap-3 rounded-xl border border-border/70 p-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">{initials}</span><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><p className="text-xs font-semibold text-foreground">{name}</p><span className="text-[10px] text-cyan">{channel}</span></div><p className="mt-1 truncate text-xs text-muted-foreground">{text}</p></div><span className="text-[10px] text-muted-foreground">now</span></div>;
}

function ComparisonColumn({ title, items, muted }: { title: string; items: readonly string[]; muted?: boolean }) {
  return <div className={cn("rounded-2xl border p-5", muted ? "border-white/10 bg-white/5" : "border-cyan/30 bg-cyan/10")}><div className="flex items-center gap-2"><span className={cn("h-2 w-2 rounded-full", muted ? "bg-slate-500" : "bg-cyan")} /><h3 className="text-sm font-semibold">{title}</h3></div><ul className="mt-5 space-y-3">{items.map((item) => <li key={item} className="flex items-start gap-2 text-sm text-slate-300"><Check className={cn("mt-0.5 h-4 w-4 shrink-0", muted ? "text-slate-500" : "text-cyan")} />{item}</li>)}</ul></div>;
}

function ContactLine({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan">{label}</p><p className="mt-1 text-sm text-foreground">{value}</p></div>;
}

function ContactFormPreview() {
  return <div className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-card)] sm:p-8"><div className="rounded-2xl bg-surface p-5"><p className="text-sm font-semibold text-foreground">Tell us about your customer workflow</p><p className="mt-2 text-sm leading-relaxed text-muted-foreground">Share your goals, channels, and current support setup. Your message goes directly to the ConversaAI admin workspace.</p><div className="mt-5 grid gap-3 sm:grid-cols-2"><div className="h-11 rounded-xl border border-border bg-background" /><div className="h-11 rounded-xl border border-border bg-background" /><div className="h-11 rounded-xl border border-border bg-background sm:col-span-2" /><div className="h-24 rounded-xl border border-border bg-background sm:col-span-2" /></div></div><Button asChild className="mt-5 w-full sm:w-auto"><Link to="/contact">Open contact form <ArrowRight className="h-4 w-4" /></Link></Button></div>;
}
