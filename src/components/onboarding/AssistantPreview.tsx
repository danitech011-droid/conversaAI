import { Bot } from "lucide-react";

import { roleLabel } from "@/lib/onboarding/options";
import { cn } from "@/lib/utils";

export function AssistantPreview({
  name,
  role,
  welcome,
  className,
}: {
  name: string;
  role: string;
  welcome: string;
  className?: string;
}) {
  const displayName = name.trim() || "Your assistant";

  return (
    <div className={cn("overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-soft)]", className)}>
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">ConversaAI</p>
        <span className="rounded-full bg-success/12 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-success">
          Preview
        </span>
      </div>
      <div className="space-y-4 p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Bot className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{displayName}</p>
            <p className="truncate text-xs text-muted-foreground">{roleLabel(role)}</p>
          </div>
        </div>
        <p className="w-fit max-w-[92%] rounded-2xl rounded-bl-sm bg-surface px-4 py-3 text-sm leading-relaxed text-foreground">
          {welcome.trim() || "Hi! How can I help you today?"}
        </p>
      </div>
    </div>
  );
}
