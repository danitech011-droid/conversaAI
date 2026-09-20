import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Brain, Search, X } from "lucide-react";

import { EmptyState } from "@/components/dashboard/EmptyState";
import { AddKnowledgeButton, AddKnowledgeDialog } from "@/components/knowledge/AddKnowledgeDialog";
import { KbFilterTabs, KbOverview } from "@/components/knowledge/KbOverview";
import { KbBadge } from "@/components/knowledge/kb-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { getKnowledgeCounts, loadAllKnowledge } from "@/lib/knowledge/api";
import { filterKnowledgeItems, searchKnowledgeItems, toKnowledgeListItems } from "@/lib/knowledge/items";
import type { KnowledgeFilter, KnowledgeListItem } from "@/lib/knowledge/types";

const TYPE_LABELS: Record<KnowledgeListItem["type"], string> = {
  general: "General",
  faq: "FAQ",
  product: "Product",
  service: "Service",
  image: "Image",
  property: "Property",
};

export function KbUnifiedHub({
  filter,
  onFilterChange,
  onManage,
  onAddType,
}: {
  filter: KnowledgeFilter;
  onFilterChange: (filter: KnowledgeFilter) => void;
  onManage: (item: KnowledgeListItem) => void;
  onAddType: (type: KnowledgeFilter) => void;
}) {
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const debouncedSearch = useDebouncedValue(search);

  const { data: counts, isLoading: countsLoading } = useQuery({
    queryKey: ["kb", "counts"],
    queryFn: getKnowledgeCounts,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["kb", "all"],
    queryFn: loadAllKnowledge,
  });

  const items = useMemo(() => {
    if (!data) return [];
    return toKnowledgeListItems(data);
  }, [data]);

  const visible = useMemo(() => {
    const filtered = filterKnowledgeItems(items, filter);
    return searchKnowledgeItems(filtered, debouncedSearch);
  }, [items, filter, debouncedSearch]);

  const showUnifiedList = filter === "all";

  return (
    <div className="space-y-6">
      <KbOverview counts={counts} loading={countsLoading} />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {filter === "all" ? (
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search your knowledge…"
              className="h-11 pl-9 pr-9"
              aria-label="Search knowledge"
            />
            {search ? (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Manage {filter === "faqs" ? "FAQs" : filter} below, or switch to All to search everything.
          </p>
        )}
        <AddKnowledgeButton onClick={() => setAddOpen(true)} />
      </div>

      <KbFilterTabs value={filter} onChange={(value) => onFilterChange(value as KnowledgeFilter)} />

      {showUnifiedList ? (
        <section aria-label="Knowledge items">
          {isLoading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((index) => (
                <Skeleton key={index} className="h-24 w-full rounded-xl" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              icon={Brain}
              title="Your AI doesn't know much yet."
              description="Add information about your organization so ConversaAI can provide better answers."
              actionLabel="Add knowledge"
              onAction={() => setAddOpen(true)}
            />
          ) : visible.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No knowledge matches your search."
              description="Try a different keyword or clear the search."
            />
          ) : (
            <div className="space-y-3">
              {visible.map((item) => (
                <article
                  key={`${item.entity}-${item.id}`}
                  className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-card)]"
                >
                  <div className="flex items-start gap-4">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt=""
                        className="h-16 w-16 shrink-0 rounded-lg border border-border object-cover"
                      />
                    ) : null}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <KbBadge>{TYPE_LABELS[item.type]}</KbBadge>
                        <KbBadge>{item.statusLabel}</KbBadge>
                      </div>
                      <h3 className="mt-2 truncate text-sm font-semibold text-foreground">
                        {item.title}
                      </h3>
                      {item.preview ? (
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.preview}</p>
                      ) : null}
                      <p className="mt-2 text-xs text-muted-foreground">
                        Updated {formatDistanceToNow(new Date(item.updated_at), { addSuffix: true })}
                        {item.meta ? ` · ${item.meta}` : ""}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => onManage(item)}>
                      Manage
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      ) : null}

      <AddKnowledgeDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSelect={(type) => {
          onAddType(type);
          onFilterChange(type);
        }}
      />
    </div>
  );
}
