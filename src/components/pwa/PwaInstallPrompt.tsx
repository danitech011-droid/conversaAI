import { Download, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaInstallPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handleInstallAvailable = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handleInstallAvailable);
    return () => window.removeEventListener("beforeinstallprompt", handleInstallAvailable);
  }, []);

  if (!installEvent || dismissed) return null;

  async function install() {
    await installEvent?.prompt();
    const choice = await installEvent?.userChoice;
    if (choice?.outcome === "accepted") setInstallEvent(null);
  }

  return (
    <div className="fixed inset-x-4 bottom-4 z-[60] flex items-center gap-3 rounded-2xl border border-border bg-card/95 p-3 shadow-[var(--shadow-elevated)] backdrop-blur-xl sm:left-auto sm:right-6 sm:max-w-sm">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Download className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">Install ConversaAI</p>
        <p className="mt-0.5 text-xs text-muted-foreground">Keep your workspace one tap away.</p>
      </div>
      <Button size="sm" onClick={install}>Install</Button>
      <button type="button" className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground" onClick={() => setDismissed(true)} aria-label="Dismiss install prompt">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
