import type { LucideIcon } from "lucide-react";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

export function SelectableCard({
  title,
  description,
  icon: Icon,
  selected,
  onSelect,
  multiple = false,
  name,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  selected: boolean;
  onSelect: () => void;
  multiple?: boolean;
  name?: string;
}) {
  return (
    <button
      type="button"
      role={multiple ? "checkbox" : "radio"}
      aria-checked={selected}
      name={name}
      onClick={onSelect}
      className={cn(
        "group relative flex h-full w-full items-start gap-3 rounded-2xl border p-4 text-left transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        selected
          ? "border-primary bg-primary/8 shadow-[var(--shadow-soft)]"
          : "border-border bg-card hover:border-primary/35 hover:bg-accent/40",
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
          selected ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
        )}
      >
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-foreground">{title}</span>
        <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{description}</span>
      </span>
      <span
        className={cn(
          "mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
          selected ? "border-primary bg-primary text-primary-foreground" : "border-input bg-background",
        )}
        aria-hidden
      >
        {selected ? <Check className="h-3 w-3" /> : null}
      </span>
    </button>
  );
}
