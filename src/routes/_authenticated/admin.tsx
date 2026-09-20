import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Activity, ArrowUpRight, Globe2, Mail, Users } from "lucide-react";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/login" });

    const { error: claimError } = await supabase.rpc("claim_first_admin");
    if (claimError) {
      console.error("[Admin] First-account claim failed. Apply the admin migration.", claimError);
    }
    const { data: admin } = await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", data.user.id)
      .maybeSingle();
    if (!admin) throw redirect({ to: "/dashboard" });
  },
  component: AdminPage,
});

type Lead = {
  id: string;
  name: string;
  email: string;
  company_name: string | null;
  business_type: string | null;
  message: string;
  status: string;
  created_at: string;
};

type Visitor = {
  id: string;
  session_id: string;
  path: string;
  device_type: string | null;
  created_at: string;
};

function AdminPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "overview"],
    queryFn: async () => {
      const [{ data: leads }, { data: visitors }] = await Promise.all([
        supabase.from("website_leads").select("*").order("created_at", { ascending: false }).limit(50),
        supabase.from("visitor_events").select("*").order("created_at", { ascending: false }).limit(100),
      ]);
      return { leads: (leads ?? []) as Lead[], visitors: (visitors ?? []) as Visitor[] };
    },
  });

  const leads = data?.leads ?? [];
  const visitors = data?.visitors ?? [];
  const uniqueVisitors = new Set(visitors.map((visitor) => visitor.session_id)).size;
  const today = new Date().toDateString();
  const todayVisitors = visitors.filter((visitor) => new Date(visitor.created_at).toDateString() === today).length;

  return (
    <DashboardLayout title="Admin console" description="Website leads and visitor activity">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-cyan">ConversaAI operations</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">See what is happening across your website</h1>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground"><span className="h-2 w-2 rounded-full bg-emerald-400" />Live data</span>
      </div>

      <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Mail} label="New leads" value={String(leads.filter((lead) => lead.status === "new").length)} detail="Awaiting response" />
        <StatCard icon={Users} label="Unique visitors" value={String(uniqueVisitors)} detail="Tracked sessions" />
        <StatCard icon={Activity} label="Visits today" value={String(todayVisitors)} detail="Page activity" />
        <StatCard icon={Globe2} label="Pages viewed" value={String(new Set(visitors.map((visitor) => visitor.path)).size)} detail="Unique paths" />
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <section className="min-w-0 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)] sm:p-6">
          <div className="flex items-center justify-between gap-4"><div><h2 className="font-semibold text-foreground">Website leads</h2><p className="mt-1 text-sm text-muted-foreground">Messages submitted through your public forms.</p></div><span className="text-xs text-muted-foreground">{leads.length} total</span></div>
          <div className="mt-5 overflow-x-auto">
            {isLoading ? <div className="space-y-3"><Skeleton className="h-14 w-full" /><Skeleton className="h-14 w-full" /><Skeleton className="h-14 w-full" /></div> : leads.length === 0 ? <EmptyPanel title="No leads yet" body="New contact submissions will appear here." /> : <table className="w-full min-w-[620px] text-left text-sm"><thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground"><tr><th className="pb-3 font-medium">Contact</th><th className="pb-3 font-medium">Company</th><th className="pb-3 font-medium">Message</th><th className="pb-3 font-medium">Status</th><th className="pb-3 font-medium">Received</th></tr></thead><tbody className="divide-y divide-border">{leads.map((lead) => <tr key={lead.id}><td className="py-4 pr-4"><p className="font-medium text-foreground">{lead.name}</p><p className="mt-1 text-xs text-muted-foreground">{lead.email}</p></td><td className="py-4 pr-4 text-muted-foreground">{lead.company_name ?? "-"}</td><td className="max-w-[240px] py-4 pr-4"><p className="truncate text-muted-foreground" title={lead.message}>{lead.message}</p></td><td className="py-4 pr-4"><span className="rounded-full bg-cyan/10 px-2.5 py-1 text-xs font-medium text-cyan">{lead.status}</span></td><td className="whitespace-nowrap py-4 text-xs text-muted-foreground">{timeAgo(lead.created_at)}</td></tr>)}</tbody></table>}
          </div>
        </section>

        <section className="min-w-0 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)] sm:p-6">
          <div><h2 className="font-semibold text-foreground">Recent visitors</h2><p className="mt-1 text-sm text-muted-foreground">The latest public activity.</p></div>
          <div className="mt-5 divide-y divide-border">{isLoading ? <div className="space-y-3"><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /></div> : visitors.length === 0 ? <EmptyPanel title="No visitor data yet" body="Public page visits will appear here." /> : visitors.slice(0, 8).map((visitor) => <div key={visitor.id} className="flex items-center gap-3 py-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Globe2 className="h-4 w-4" /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-foreground">{visitor.path}</p><p className="mt-1 text-xs text-muted-foreground">{visitor.device_type ?? "Unknown device"}</p></div><span className="shrink-0 text-xs text-muted-foreground">{timeAgo(visitor.created_at)}</span></div>)}</div>
          <div className="mt-5 flex items-center gap-2 border-t border-border pt-4 text-xs text-muted-foreground"><ArrowUpRight className="h-4 w-4 text-cyan" />Visitor data updates as people browse your site.</div>
        </section>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ icon: Icon, label, value, detail }: { icon: typeof Mail; label: string; value: string; detail: string }) {
  return <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]"><div className="flex items-center justify-between"><p className="text-sm font-medium text-muted-foreground">{label}</p><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="h-4 w-4" /></span></div><p className="mt-5 text-3xl font-semibold tracking-tight text-foreground">{value}</p><p className="mt-1 text-xs text-muted-foreground">{detail}</p></div>;
}

function EmptyPanel({ title, body }: { title: string; body: string }) {
  return <div className="rounded-xl border border-dashed border-border px-4 py-10 text-center"><p className="text-sm font-medium text-foreground">{title}</p><p className="mt-1 text-xs text-muted-foreground">{body}</p></div>;
}

function timeAgo(iso: string) {
  const minutes = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}
