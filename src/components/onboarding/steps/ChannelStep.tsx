import { Globe, Instagram, MessageCircle, Radio, Send } from "lucide-react";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

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
import { Spinner } from "@/components/ui/spinner";
import {
  CHANNEL_DEFINITIONS,
  listChannels,
  saveChannel,
  type ChannelDefinition,
} from "@/lib/workspace/api";
import { cn } from "@/lib/utils";

const COMING_SOON = new Set(["instagram", "messenger", "telegram"]);

export function ChannelStep({
  website,
  welcome,
  selected,
  connected,
  onSelect,
  onConnected,
}: {
  website: string;
  welcome: string;
  selected: "web" | "whatsapp" | null;
  connected: boolean;
  onSelect: (value: "web" | "whatsapp") => void;
  onConnected: (value: "web" | "whatsapp") => void;
}) {
  const queryClient = useQueryClient();
  const { data: channels = [] } = useQuery({ queryKey: ["workspace", "channels"], queryFn: listChannels });
  const byType = useMemo(() => new Map(channels.map((channel) => [channel.channel_type, channel])), [channels]);
  const [active, setActive] = useState<ChannelDefinition | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});

  const connectable = CHANNEL_DEFINITIONS.filter((item) => item.type === "web" || item.type === "whatsapp");
  const soon = CHANNEL_DEFINITIONS.filter((item) => COMING_SOON.has(item.type));

  function openConnect(type: "web" | "whatsapp") {
    const definition = CHANNEL_DEFINITIONS.find((item) => item.type === type);
    if (!definition) return;
    onSelect(type);
    const existing = byType.get(type);
    const defaults: Record<string, string> = { ...(existing?.config ?? {}) };
    if (type === "web") {
      defaults["site_url"] = defaults["site_url"] || website;
      defaults["greeting"] = defaults["greeting"] || welcome;
    }
    setForm(defaults);
    setActive(definition);
  }

  const save = useMutation({
    mutationFn: async () => {
      if (!active) return;
      const missing = active.fields.filter((field) => !(form[field.key] ?? "").trim());
      if (missing.length) throw new Error(`Fill in ${missing.map((field) => field.label).join(", ")}.`);
      const existing = byType.get(active.type);
      await saveChannel({
        ...(existing ? { id: existing.id } : {}),
        channel_type: active.type,
        display_name: active.name,
        status: "connected",
        config: form,
      });
    },
    onSuccess: () => {
      if (active) onConnected(active.type as "web" | "whatsapp");
      toast.success("Channel connected");
      setActive(null);
      queryClient.invalidateQueries({ queryKey: ["workspace"] });
    },
    onError: (error: Error) => toast.error("Couldn't connect channel", { description: error.message }),
  });

  return (
    <div className="space-y-3">
      {connectable.map((channel) => {
        const record = byType.get(channel.type);
        const isConnected = record?.status === "connected";
        const recommended = channel.type === "web";
        return (
          <article
            key={channel.type}
            className={cn(
              "rounded-2xl border bg-card p-5 transition-colors",
              selected === channel.type ? "border-primary" : "border-border",
            )}
          >
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                {channel.type === "web" ? <Globe className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-sm font-semibold text-foreground">{channel.name}</h2>
                  {recommended ? (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
                      Recommended
                    </span>
                  ) : null}
                  {isConnected ? (
                    <span className="rounded-full bg-success/12 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-success">
                      Connected
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {channel.type === "web"
                    ? "Add ConversaAI to your website."
                    : "Connect your WhatsApp Business account."}
                </p>
                <Button
                  type="button"
                  variant={isConnected ? "outline" : "default"}
                  size="sm"
                  className="mt-3"
                  onClick={() => openConnect(channel.type as "web" | "whatsapp")}
                >
                  {isConnected ? "Update connection" : channel.type === "web" ? "Connect website" : "Connect WhatsApp"}
                </Button>
              </div>
            </div>
          </article>
        );
      })}

      {soon.map((channel) => (
        <article key={channel.type} className="rounded-2xl border border-border bg-surface p-5 opacity-90">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              {channel.type === "instagram" ? (
                <Instagram className="h-5 w-5" />
              ) : channel.type === "telegram" ? (
                <Send className="h-5 w-5" />
              ) : (
                <Radio className="h-5 w-5" />
              )}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-foreground">{channel.name}</h2>
                <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  Coming soon
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{channel.tagline}</p>
            </div>
          </div>
        </article>
      ))}

      <p className="text-xs text-muted-foreground">
        {connected
          ? "You can add more channels later from the dashboard."
          : "You can skip this and connect a channel later."}
      </p>

      <Dialog open={Boolean(active)} onOpenChange={(open) => !open && setActive(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect {active?.name}</DialogTitle>
            <DialogDescription>
              Credentials stay in your workspace. We will not mark this channel as connected unless these details are saved.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {active?.fields.map((field) => (
              <div key={field.key} className="space-y-1.5">
                <Label htmlFor={field.key}>{field.label}</Label>
                {field.textarea ? (
                  <Textarea
                    id={field.key}
                    value={form[field.key] ?? ""}
                    onChange={(event) => setForm((current) => ({ ...current, [field.key]: event.target.value }))}
                    placeholder={field.placeholder}
                  />
                ) : (
                  <Input
                    id={field.key}
                    type={field.secret ? "password" : "text"}
                    value={form[field.key] ?? ""}
                    onChange={(event) => setForm((current) => ({ ...current, [field.key]: event.target.value }))}
                    placeholder={field.placeholder}
                  />
                )}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setActive(null)}>
              Cancel
            </Button>
            <Button type="button" onClick={() => save.mutate()} disabled={save.isPending} className="gap-2">
              {save.isPending ? <Spinner className="h-4 w-4" /> : null}
              Save connection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
