import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BookOpen,
  Boxes,
  Building2,
  FileText,
  HelpCircle,
  ImageIcon,
  MessageSquare,
  Radio,
  Sparkles,
  Users,
  Wrench,
} from "lucide-react";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { getKnowledgeCounts, loadKnowledgeChunks } from "@/lib/knowledge/api";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — ConversaAI" },
      {
        name: "description",
        content:
          "Track your Knowledge Base coverage, recent updates and next steps for your AI assistant.",
      },
      { property: "og:title", content: "Dashboard — ConversaAI" },
      { property: "og:description", content: "Your ConversaAI workspace at a glance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardPage,
});

const ENTITY_META = {
  general: { label: "General", icon: FileText },
  faqs: { label: "FAQ", icon: HelpCircle },
  products: { label: "Product", icon: Boxes },
  services: { label: "Service", icon: Wrench },
  images: { label: "Image", icon: ImageIcon },
  properties: { label: "Property", icon: Building2 },
} as const;

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

function DashboardPage() {
  const navigate = useNavigate();

  const { data: business } = useQuery({
    queryKey: ["business", "summary"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) return null;
      const [{ data: profile }, { data: record }] = await Promise.all([
        supabase.from("profiles").select("onboarding_completed").eq("id", user.id).maybeSingle(),
        supabase.from("businesses").select("company_name").eq("owner_id", user.id).maybeSingle(),
      ]);
      if (!profile?.onboarding_completed) {
        navigate({ to: "/onboarding", replace: true });
      }
      return record ?? null;
    },
  });

  const { data: counts, isLoading: countsLoading } = useQuery({
    queryKey: ["kb", "counts"],
    queryFn: getKnowledgeCounts,
  });

  const { data: chunks = [], isLoading: activityLoading } = useQuery({
    queryKey: ["kb", "chunks"],
    queryFn: loadKnowledgeChunks,
  });

  const recent = [...chunks]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 6);

  const cards = [
    { key: "faqs", label: "FAQs", value: counts?.faqs ?? 0, icon: HelpCircle },
    { key: "products", label: "Products", value: counts?.products ?? 0, icon: Boxes },
    { key: "services", label: "Services", value: counts?.services ?? 0, icon: Wrench },
    { key: "properties", label: "Properties", value: counts?.properties ?? 0, icon: Building2 },
  ];

  return (
    <DashboardLayout
      title={business?.company_name ? `${business.company_name} workspace` : "Dashboard"}
      description="Knowledge Base coverage and next steps"
    >
      {/* Summary cards */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.key}
            className="animate-fade-in rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-card)]"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <card.icon className="h-[18px] w-[18px]" />
              </span>
            </div>
            {countsLoading ? (
              <Skeleton className="mt-4 h-8 w-16" />
            ) : (
              <p className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
                {card.value}
              </p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">entries in your Knowledge Base</p>
          </div>
        ))}
      </section>

      {/* Knowledge readiness */}
      <section className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-foreground">Assistant readiness</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {counts?.total
                ? `${counts.total} knowledge entr${counts.total === 1 ? "y" : "ies"} ready for your assistant.`
                : "Add your first knowledge entries so your assistant has something to answer with."}
            </p>
          </div>
          <Button asChild className="gap-2">
            <Link to="/knowledge-base" search={{ tab: "faqs", new: false }}>
              Manage Knowledge Base
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-surface">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-500"
            style={{ width: `${Math.min(100, ((counts?.total ?? 0) / 20) * 100)}%` }}
          />
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Recent activity */}
        <section className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
          <h2 className="text-base font-semibold text-foreground">Recent activity</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Latest updates across your Knowledge Base
          </p>

          <div className="mt-5">
            {activityLoading ? (
              <div className="space-y-3">
                {[0, 1, 2].map((row) => (
                  <Skeleton key={row} className="h-14 w-full" />
                ))}
              </div>
            ) : recent.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="No activity yet"
                description="Once you add FAQs, products, services or properties, their updates show up here."
                actionLabel="Add knowledge"
                onAction={() => navigate({ to: "/knowledge-base", search: { tab: "faqs", new: true } })}
              />
            ) : (
              <ul className="divide-y divide-border">
                {recent.map((item) => {
                  const meta = ENTITY_META[item.entity];
                  const Icon = meta.icon;
                  return (
                    <li key={`${item.entity}-${item.id}`} className="flex items-center gap-3 py-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {item.title}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {meta.label}
                          {item.meta ? ` · ${item.meta}` : ""}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {timeAgo(item.updated_at)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>

        {/* Quick actions */}
        <section className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
          <h2 className="text-base font-semibold text-foreground">Quick actions</h2>
          <p className="mt-1 text-sm text-muted-foreground">Jump straight into your next task</p>

          <div className="mt-5 space-y-3">
            <QuickAction
              icon={HelpCircle}
              title="Add an FAQ"
              description="Answer a common customer question"
              to="/knowledge-base"
              search={{ tab: "faqs", new: true }}
            />
            <QuickAction
              icon={Boxes}
              title="Add a product"
              description="Name, price, availability & photos"
              to="/knowledge-base"
              search={{ tab: "products", new: true }}
            />
            <QuickAction
              icon={Wrench}
              title="Add a service"
              description="Duration, pricing & availability"
              to="/knowledge-base"
              search={{ tab: "services", new: true }}
            />
            <QuickAction
              icon={Building2}
              title="Add a property"
              description="Listings with photos and features"
              to="/knowledge-base"
              search={{ tab: "properties", new: true }}
            />
            <QuickAction
              icon={BookOpen}
              title="Update company info"
              description="Hours, contact details & socials"
              to="/knowledge-base"
              search={{ tab: "company", new: false }}
            />
            <QuickAction
              icon={Sparkles}
              title="Test your AI"
              description="Preview answers in mock mode"
              to="/test-ai"
            />
            <QuickAction
              icon={Users}
              title="Customers"
              description="Customer profiles — coming soon"
              to="/customers"
            />
            <QuickAction
              icon={MessageSquare}
              title="Conversations"
              description="Live inbox — coming soon"
              to="/conversations"
            />
            <QuickAction
              icon={Radio}
              title="Channels"
              description="WhatsApp & web widget — coming soon"
              to="/channels"
            />
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}

function QuickAction({
  icon: Icon,
  title,
  description,
  to,
  search,
}: {
  icon: typeof BookOpen;
  title: string;
  description: string;
  to: string;
  search?: { tab: string; new: boolean };
}) {

  return (
    <Link
      to={to}
      search={search as never}
      className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 transition-colors hover:border-primary/40 hover:bg-accent"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{title}</p>
        <p className="truncate text-xs text-muted-foreground">{description}</p>
      </div>
      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
    </Link>
  );
}
