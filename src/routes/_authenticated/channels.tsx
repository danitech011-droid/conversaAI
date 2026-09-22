import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  CheckCircle2,
  Globe,
  Instagram,
  Loader2,
  Mail,
  MessageCircle,
  PlugZap,
  Radio,
  Send,
  Settings2,
  XCircle,
  Copy,
} from "lucide-react";
import { toast } from "sonner";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { SectionCard, StatusPill } from "@/components/dashboard/SectionCard";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CHANNEL_DEFINITIONS,
  disconnectChannel,
  listChannels,
  saveChannel,
  testChannel,
  type Channel,
  type ChannelDefinition,
  type ChannelTestResult,
} from "@/lib/workspace/api";
import {
  createWebsiteInstallation,
  getEmbedCode,
  listWebsiteInstallations,
  setWebsiteInstallationActive,
  type WebsiteInstallation,
} from "@/lib/website/installations";

export const Route = createFileRoute("/_authenticated/channels")({
  head: () => ({
    meta: [
      { title: "Channels — ConversaAI" },
      {
        name: "description",
        content:
          "Configure WhatsApp, the website widget, Instagram, Messenger, Telegram and email for your AI assistant.",
      },
      { property: "og:title", content: "Channels — ConversaAI" },
      { property: "og:description", content: "Connect the places your customers message you." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ChannelsPage,
});

const ICONS: Record<string, typeof Radio> = {
  whatsapp: MessageCircle,
  web: Globe,
  instagram: Instagram,
  messenger: MessageCircle,
  telegram: Send,
  email: Mail,
};

function ChannelsPage() {
  const queryClient = useQueryClient();
  const [active, setActive] = useState<ChannelDefinition | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [testResult, setTestResult] = useState<ChannelTestResult | null>(null);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [createdInstallation, setCreatedInstallation] = useState<WebsiteInstallation | null>(null);


  const { data: channels = [], isLoading } = useQuery({
    queryKey: ["workspace", "channels"],
    queryFn: listChannels,
  });

  const { data: installations = [], isLoading: installationsLoading } = useQuery({
    queryKey: ["website-installations"],
    queryFn: listWebsiteInstallations,
  });

  const byType = new Map(channels.map((channel) => [channel.channel_type, channel]));
  const activeRecord = active ? byType.get(active.type) : undefined;

  useEffect(() => {
    if (!active) return;
    setTestResult(null);
    setForm({ ...(byType.get(active.type)?.config ?? {}) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const save = useMutation({
    mutationFn: async (status: string) => {
      if (!active) return;
      if (status === "connected") {
        const missing = active.fields.filter((field) => !(form[field.key] ?? "").trim());
        if (missing.length) throw new Error(`Fill in ${missing.map((f) => f.label).join(", ")}.`);
      }
      await saveChannel({
        ...(activeRecord ? { id: activeRecord.id } : {}),
        channel_type: active.type,
        display_name: active.name,
        status,
        config: form,
      });
    },
    onSuccess: () => {
      toast.success("Channel saved");
      setActive(null);
      queryClient.invalidateQueries({ queryKey: ["workspace"] });
    },
    onError: (error: Error) => toast.error("Couldn't save channel", { description: error.message }),
  });

  const disconnect = useMutation({
    mutationFn: (channel: Channel) => disconnectChannel(channel),
    onSuccess: () => {
      toast.success("Channel disconnected");
      queryClient.invalidateQueries({ queryKey: ["workspace"] });
    },
    onError: (error: Error) => toast.error("Couldn't disconnect", { description: error.message }),
  });

  const test = useMutation({
    mutationFn: async (input: { definition: ChannelDefinition; config: Record<string, string> }) =>
      testChannel(input.definition, input.config),
    onSuccess: (result) => {
      setTestResult(result);
      if (result.ok) toast.success("Configuration test passed");
      else toast.error("Configuration test failed", { description: "Check the report for details." });
      queryClient.invalidateQueries({ queryKey: ["workspace", "audit"] });
    },
    onError: (error: Error) => toast.error("Couldn't run the test", { description: error.message }),
  });

  const connectedCount = channels.filter((channel) => channel.status === "connected").length;

  const connectWebsite = useMutation({
    mutationFn: () => createWebsiteInstallation({ websiteUrl }),
    onSuccess: (installation) => {
      setCreatedInstallation(installation);
      setWebsiteUrl("");
      queryClient.invalidateQueries({ queryKey: ["website-installations"] });
      toast.success("Website connection created");
    },
    onError: (error: Error) => toast.error("Couldn't connect website", { description: error.message }),
  });

  const toggleWebsite = useMutation({
    mutationFn: (installation: WebsiteInstallation) =>
      setWebsiteInstallationActive(installation, !installation.is_active),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["website-installations"] }),
    onError: (error: Error) => toast.error("Couldn't update website", { description: error.message }),
  });


  return (
    <DashboardLayout title="Channels" description="Where your assistant meets your customers">
      <div className="space-y-6">
        <SectionCard
          icon={Radio}
          title="Connection overview"
          description={`${connectedCount} of ${CHANNEL_DEFINITIONS.length} channels configured.`}
        >
          <p className="text-sm text-muted-foreground">
            Credentials are stored securely against your workspace. Live message delivery goes live
            once the messaging engine ships — configuration you save now carries over.
          </p>
        </SectionCard>

        <SectionCard
          icon={Globe}
          title="Connect your website"
          description="Install the assistant on a website you control."
          actions={
            <StatusPill tone={installations.some((item) => item.is_active) ? "success" : "neutral"}>
              {installations.some((item) => item.is_active) ? "Connected" : "Not connected"}
            </StatusPill>
          }
        >
          <div className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                value={websiteUrl}
                placeholder="https://yourbusiness.com"
                onChange={(event) => setWebsiteUrl(event.target.value)}
                aria-label="Website URL"
              />
              <Button
                className="gap-2 sm:shrink-0"
                disabled={connectWebsite.isPending || !websiteUrl.trim()}
                onClick={() => connectWebsite.mutate()}
              >
                {connectWebsite.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Connect website
              </Button>
            </div>
            {installationsLoading ? (
              <p className="text-sm text-muted-foreground">Loading website connections...</p>
            ) : (
              <div className="space-y-3">
                {[...installations, ...(createdInstallation && !installations.some((item) => item.id === createdInstallation.id) ? [createdInstallation] : [])].map((installation) => (
                  <div key={installation.id} className="space-y-3 rounded-xl border border-border bg-surface p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-foreground">{installation.domain}</p>
                        <p className="text-xs text-muted-foreground">Status: {installation.status}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleWebsite.mutate(installation)}
                        disabled={toggleWebsite.isPending}
                      >
                        {installation.is_active ? "Disable" : "Enable"}
                      </Button>
                    </div>
                    <div className="flex items-start gap-2">
                      <code className="min-w-0 flex-1 break-all rounded-md bg-muted p-2 text-xs text-muted-foreground">
                        {getEmbedCode(installation)}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Copy installation code"
                        title="Copy installation code"
                        onClick={() => {
                          void navigator.clipboard.writeText(getEmbedCode(installation));
                          toast.success("Installation code copied");
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </SectionCard>

        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading channels…
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {CHANNEL_DEFINITIONS.map((definition) => {
              const record = byType.get(definition.type);
              const Icon = ICONS[definition.type] ?? Radio;
              const connected = record?.status === "connected";
              return (
                <SectionCard
                  key={definition.type}
                  icon={Icon}
                  title={definition.name}
                  description={definition.tagline}
                  actions={
                    <StatusPill tone={connected ? "success" : "neutral"}>
                      {connected ? "Connected" : record ? "Draft" : "Not set up"}
                    </StatusPill>
                  }
                >
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" className="gap-2" onClick={() => setActive(definition)}>
                      <Settings2 className="h-4 w-4" />
                      {record ? "Configure" : "Set up"}
                    </Button>
                    {record && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2"
                        disabled={test.isPending}
                        onClick={() => {
                          setForm({ ...(record.config ?? {}) });
                          setActive(definition);
                          test.mutate({ definition, config: record.config ?? {} });
                        }}
                      >
                        <PlugZap className="h-4 w-4" />
                        Test
                      </Button>
                    )}
                    {connected && record && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={disconnect.isPending}
                        onClick={() => disconnect.mutate(record)}
                      >
                        Disconnect
                      </Button>
                    )}
                  </div>
                </SectionCard>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={Boolean(active)} onOpenChange={(open) => !open && setActive(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{active?.name}</DialogTitle>
            <DialogDescription>{active?.tagline}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {active?.fields.map((field) => (
              <div key={field.key} className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">{field.label}</Label>
                {field.textarea ? (
                  <Textarea
                    rows={3}
                    value={form[field.key] ?? ""}
                    placeholder={field.placeholder}
                    onChange={(event) => setForm({ ...form, [field.key]: event.target.value })}
                  />
                ) : (
                  <Input
                    type={field.secret ? "password" : "text"}
                    value={form[field.key] ?? ""}
                    placeholder={field.placeholder}
                    onChange={(event) => setForm({ ...form, [field.key]: event.target.value })}
                  />
                )}
              </div>
            ))}
          </div>

          {testResult && (
            <div className="space-y-2 rounded-xl border border-border bg-surface p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-foreground">
                  {testResult.ok ? "Configuration looks ready" : "Configuration needs attention"}
                </p>
                <StatusPill tone={testResult.ok ? "success" : "warning"}>
                  {testResult.latencyMs} ms
                </StatusPill>
              </div>
              <ul className="space-y-1.5">
                {testResult.checks.map((check) => (
                  <li key={check.label} className="flex items-start gap-2 text-xs">
                    {check.status === "pass" ? (
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                    ) : check.status === "warn" ? (
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                    ) : (
                      <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive" />
                    )}
                    <span className="text-muted-foreground">
                      <span className="font-medium text-foreground">{check.label}:</span>{" "}
                      {check.detail}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              className="gap-2 sm:mr-auto"
              disabled={test.isPending || !active}
              onClick={() => active && test.mutate({ definition: active, config: form })}
            >
              {test.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <PlugZap className="h-4 w-4" />
              )}
              Test configuration
            </Button>
            <Button
              variant="outline"
              onClick={() => save.mutate("disconnected")}
              disabled={save.isPending}
            >
              Save draft
            </Button>
            <Button onClick={() => save.mutate("connected")} disabled={save.isPending} className="gap-2">
              {save.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Connect channel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
