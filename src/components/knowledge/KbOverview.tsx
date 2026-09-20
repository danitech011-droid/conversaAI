import {
  Boxes,
  FileText,
  HelpCircle,
  ImageIcon,
  Layers,
  Sparkles,
  Wrench,
} from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type Counts = {
  total: number;
  general: number;
  faqs: number;
  products: number;
  services: number;
  images: number;
  other: number;
};

const CARDS = [
  { key: "total", label: "Total knowledge", icon: Layers },
  { key: "faqs", label: "FAQs", icon: HelpCircle },
  { key: "products", label: "Products", icon: Boxes },
  { key: "services", label: "Services", icon: Wrench },
  { key: "other", label: "Other", icon: Sparkles },
] as const;

export function KbOverview({
  counts,
  loading,
}: {
  counts: Counts | undefined;
  loading: boolean;
}) {
  return (
    <section aria-label="Knowledge overview" className="mb-8">
      <h2 className="mb-3 text-sm font-semibold text-foreground">Knowledge overview</h2>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {CARDS.map((card) => {
          const Icon = card.icon;
          const value = counts?.[card.key] ?? 0;
          return (
            <article
              key={card.key}
              className="rounded-xl border border-border bg-card px-4 py-4 shadow-[var(--shadow-soft)]"
            >
              <div className="flex items-center gap-2 text-muted-foreground">
                <Icon className="h-4 w-4 text-primary" aria-hidden />
                <span className="text-xs font-medium">{card.label}</span>
              </div>
              {loading ? (
                <Skeleton className="mt-3 h-8 w-12" />
              ) : (
                <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

export const FILTER_TABS = [
  { value: "all", label: "All", icon: Layers },
  { value: "general", label: "General", icon: FileText },
  { value: "faqs", label: "FAQs", icon: HelpCircle },
  { value: "products", label: "Products", icon: Boxes },
  { value: "services", label: "Services", icon: Wrench },
  { value: "images", label: "Images", icon: ImageIcon },
] as const;

export function KbFilterTabs({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="-mx-1 overflow-x-auto px-1">
      <div className="flex w-max gap-1 rounded-xl border border-border bg-surface p-1">
        {FILTER_TABS.map((tab) => {
          const Icon = tab.icon;
          const active = value === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => onChange(tab.value)}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-card text-foreground shadow-[var(--shadow-soft)]"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" aria-hidden />
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
