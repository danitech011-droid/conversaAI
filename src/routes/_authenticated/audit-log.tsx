import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, History, Loader2, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { SectionCard, StatusPill } from "@/components/dashboard/SectionCard";
import { SelectInput } from "@/components/knowledge/kb-ui";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { downloadFile, rowsToCsv } from "@/lib/knowledge/io";
import { clearAuditEntries, listAuditEntries } from "@/lib/workspace/api";

export const Route = createFileRoute("/_authenticated/audit-log")({
  head: () => ({
    meta: [
      { title: "Audit log — ConversaAI" },
      {
        name: "description",
        content: "Review every change made to your knowledge base, team and channels.",
      },
      { property: "og:title", content: "Audit log — ConversaAI" },
      { property: "og:description", content: "A complete activity trail for your workspace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuditLogPage,
});

const AREAS = [
  { value: "all", label: "All areas" },
  { value: "knowledge-base", label: "Knowledge base" },
  { value: "team", label: "Team" },
  { value: "channels", label: "Channels" },
  { value: "general", label: "General" },
];

const AREA_TONE: Record<string, string> = {
  "knowledge-base": "info",
  team: "success",
  channels: "warning",
};

function formatDate(value: string) {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

const RANGES = [
  { value: "all", label: "All time" },
  { value: "24h", label: "Last 24 hours" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
];

const RANGE_MS: Record<string, number> = {
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
};

function AuditLogPage() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [area, setArea] = useState("all");
  const [action, setAction] = useState("all");
  const [range, setRange] = useState("all");
  const [confirmClear, setConfirmClear] = useState(false);

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["workspace", "audit"],
    queryFn: () => listAuditEntries(300),
  });

  const actionOptions = useMemo(
    () => [
      { value: "all", label: "All actions" },
      ...Array.from(new Set(entries.map((entry) => entry.action)))
        .sort()
        .map((value) => ({ value, label: value })),
    ],
    [entries],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const cutoff = RANGE_MS[range] ? Date.now() - (RANGE_MS[range] as number) : null;
    return entries.filter((entry) => {
      if (area !== "all" && entry.area !== area) return false;
      if (action !== "all" && entry.action !== action) return false;
      if (cutoff && new Date(entry.created_at).getTime() < cutoff) return false;
      if (!needle) return true;
      return `${entry.action} ${entry.summary} ${entry.actor_email ?? ""}`
        .toLowerCase()
        .includes(needle);
    });
  }, [entries, query, area, action, range]);

  const clear = useMutation({
    mutationFn: clearAuditEntries,
    onSuccess: () => {
      toast.success("Audit log cleared");
      setConfirmClear(false);
      queryClient.invalidateQueries({ queryKey: ["workspace", "audit"] });
    },
    onError: (error: Error) => toast.error("Couldn't clear log", { description: error.message }),
  });

  const stamp = () => new Date().toISOString().slice(0, 10);

  function exportCsv() {
    if (filtered.length === 0) {
      toast.error("Nothing to export yet");
      return;
    }
    downloadFile(
      `conversaai-audit-log-${stamp()}.csv`,
      rowsToCsv(
        filtered.map((entry) => ({
          timestamp: entry.created_at,
          actor: entry.actor_email ?? "",
          area: entry.area,
          action: entry.action,
          summary: entry.summary,
        })),
      ),
      "text/csv",
    );
    toast.success(`Exported ${filtered.length} entries`);
  }

  function exportJson() {
    if (filtered.length === 0) {
      toast.error("Nothing to export yet");
      return;
    }
    downloadFile(
      `conversaai-audit-log-${stamp()}.json`,
      JSON.stringify(
        { exported_at: new Date().toISOString(), filters: { area, action, range, query }, entries: filtered },
        null,
        2,
      ),
      "application/json",
    );
    toast.success(`Exported ${filtered.length} entries`);
  }

  const filtersActive = area !== "all" || action !== "all" || range !== "all" || query.trim() !== "";


  return (
    <DashboardLayout title="Audit log" description="Every change made in this workspace">
      <SectionCard
        icon={History}
        title="Activity trail"
        description={`${entries.length} recorded event${entries.length === 1 ? "" : "s"}.`}
        actions={
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={exportCsv}>
                  Filtered results (CSV)
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={exportJson}>
                  Filtered results (JSON)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              size="sm"
              variant="outline"
              className="gap-2"
              onClick={() => setConfirmClear(true)}
            >
              <Trash2 className="h-4 w-4" />
              Clear
            </Button>
          </>
        }
      >
        <div className="mb-4 flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search actions, people or summaries"
              className="h-11 pl-9"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <SelectInput label="Area" value={area} onChange={setArea} options={AREAS} />
            <SelectInput
              label="Action"
              value={action}
              onChange={setAction}
              options={actionOptions}
            />
            <SelectInput label="Time range" value={range} onChange={setRange} options={RANGES} />
          </div>
        </div>

        <div className="mb-5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>
            Showing {filtered.length} of {entries.length} events
          </span>
          {filtersActive && (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-xs"
              onClick={() => {
                setQuery("");
                setArea("all");
                setAction("all");
                setRange("all");
              }}
            >
              Clear filters
            </Button>
          )}
        </div>


        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading activity…
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <EmptyState
            icon={History}
            title={entries.length ? "No matching activity" : "No activity yet"}
            description={
              entries.length
                ? "Try a different search term or area filter."
                : "Changes to your knowledge base, team and channels will appear here."
            }
          />
        )}

        {!isLoading && filtered.length > 0 && (
          <ol className="relative space-y-0 border-l border-border pl-6">
            {filtered.map((entry) => (
              <li key={entry.id} className="relative pb-6 last:pb-0">
                <span className="absolute -left-[27px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-background" />
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-foreground">{entry.summary}</p>
                  <StatusPill tone={AREA_TONE[entry.area] ?? "neutral"}>{entry.area}</StatusPill>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {entry.action} · {entry.actor_email ?? "system"} · {formatDate(entry.created_at)}
                </p>
              </li>
            ))}
          </ol>
        )}
      </SectionCard>

      <AlertDialog open={confirmClear} onOpenChange={setConfirmClear}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear the audit log?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes every recorded event for this workspace.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => clear.mutate()}>Clear log</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
