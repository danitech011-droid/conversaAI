import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, Download, Loader2, Upload, XCircle } from "lucide-react";
import { toast } from "sonner";

import { StatusPill } from "@/components/dashboard/SectionCard";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  downloadFile,
  exportKbCsv,
  exportKbJson,
  importKbJson,
  type ImportResult,
} from "@/lib/knowledge/io";
import type { KbEntity } from "@/lib/knowledge/types";
import { logAudit } from "@/lib/workspace/api";

const CSV_ENTITIES: { value: KbEntity; label: string }[] = [
  { value: "general", label: "General (CSV)" },
  { value: "faqs", label: "FAQs (CSV)" },
  { value: "products", label: "Products (CSV)" },
  { value: "services", label: "Services (CSV)" },
  { value: "images", label: "Images (CSV)" },
  { value: "properties", label: "Properties (CSV)" },
];

const SECTION_LABELS: Record<KbEntity, string> = {
  general: "General",
  faqs: "FAQs",
  products: "Products",
  services: "Services",
  images: "Images",
  properties: "Properties",
};

export function KbTransfer() {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  async function run(task: () => Promise<void>) {
    setBusy(true);
    try {
      await task();
    } catch (error) {
      toast.error("Something went wrong", { description: (error as Error).message });
    } finally {
      setBusy(false);
    }
  }

  async function handleFile(file: File) {
    await run(async () => {
      const outcome = await importKbJson(await file.text(), file.name);
      await logAudit({
        action: "kb.imported",
        area: "knowledge-base",
        summary: `Imported ${outcome.imported} knowledge base entries from ${file.name}`,
        metadata: {
          imported: outcome.imported,
          skipped: outcome.skipped,
          failed: outcome.failed,
          file: file.name,
        },
      });
      await queryClient.invalidateQueries({ queryKey: ["kb"] });
      setResult(outcome);
      if (outcome.imported === 0) {
        toast.error("Nothing was imported", { description: "Review the import report for details." });
      } else {
        toast.success(`Imported ${outcome.imported} entries`);
      }
    });
  }

  function downloadReport() {
    if (!result) return;
    downloadFile(
      `conversaai-import-report-${new Date().toISOString().slice(0, 10)}.json`,
      JSON.stringify(result, null, 2),
      "application/json",
    );
  }

  const sectionRows: { entity: KbEntity; count: number }[] = result
    ? [
        { entity: "general", count: result.general },
        { entity: "faqs", count: result.faqs },
        { entity: "products", count: result.products },
        { entity: "services", count: result.services },
        { entity: "images", count: result.images },
        { entity: "properties", count: result.properties },
      ]
    : [];

  return (
    <div className="flex items-center gap-2">
      <input
        ref={inputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) void handleFile(file);
        }}
      />
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        Import
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2" disabled={busy}>
            <Download className="h-4 w-4" />
            Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
            Full backup
          </DropdownMenuLabel>
          <DropdownMenuItem
            onSelect={() =>
              void run(async () => {
                const count = await exportKbJson();
                await logAudit({
                  action: "kb.exported",
                  area: "knowledge-base",
                  summary: `Exported ${count} knowledge base entries as JSON`,
                });
                toast.success(`Exported ${count} entries`);
              })
            }
          >
            Everything (JSON)
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
            Spreadsheet
          </DropdownMenuLabel>
          {CSV_ENTITIES.map((entity) => (
            <DropdownMenuItem
              key={entity.value}
              onSelect={() =>
                void run(async () => {
                  const count = await exportKbCsv(entity.value);
                  await logAudit({
                    action: "kb.exported",
                    area: "knowledge-base",
                    summary: `Exported ${count} ${entity.value} as CSV`,
                  });
                  toast.success(`Exported ${count} rows`);
                })
              }
            >
              {entity.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={Boolean(result)} onOpenChange={(open) => !open && setResult(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Import report</DialogTitle>
            <DialogDescription>
              {result?.fileName ?? "Your file"} processed in{" "}
              {Math.max(1, Math.round((result?.durationMs ?? 0) / 100) / 10)}s.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-border bg-surface p-3 text-center">
              <p className="text-xl font-semibold text-foreground">{result?.imported ?? 0}</p>
              <p className="text-xs text-muted-foreground">Imported</p>
            </div>
            <div className="rounded-xl border border-border bg-surface p-3 text-center">
              <p className="text-xl font-semibold text-foreground">{result?.skipped ?? 0}</p>
              <p className="text-xs text-muted-foreground">Skipped</p>
            </div>
            <div className="rounded-xl border border-border bg-surface p-3 text-center">
              <p className="text-xl font-semibold text-foreground">{result?.failed ?? 0}</p>
              <p className="text-xs text-muted-foreground">Failed</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {sectionRows.map((row) => (
              <StatusPill key={row.entity} tone={row.count ? "success" : "neutral"}>
                {SECTION_LABELS[row.entity]}: {row.count}
              </StatusPill>
            ))}
          </div>

          {result && result.issues.length > 0 && (
            <div className="max-h-56 space-y-2 overflow-y-auto rounded-xl border border-border p-3">
              {result.issues.map((issue, index) => (
                <div key={`${issue.section}-${issue.row}-${index}`} className="flex gap-2">
                  {issue.reason.toLowerCase().includes("required") ? (
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                  ) : (
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm text-foreground">
                      {SECTION_LABELS[issue.section]} · row {issue.row} — {issue.label}
                    </p>
                    <p className="text-xs text-muted-foreground">{issue.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {result && result.issues.length === 0 && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Every row in the file was imported cleanly.
            </p>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={downloadReport}>
              Download report
            </Button>
            <Button onClick={() => setResult(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
