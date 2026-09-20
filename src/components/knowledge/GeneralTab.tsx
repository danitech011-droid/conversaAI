import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText } from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/dashboard/EmptyState";
import {
  DeleteDialog,
  KbBadge,
  KbCard,
  KbDialog,
  KbToolbar,
  PagedList,
  SelectInput,
  TextAreaInput,
  TextInput,
  sortItems,
  type SortValue,
} from "@/components/knowledge/kb-ui";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { deleteKbItem, listGeneral, saveGeneral } from "@/lib/knowledge/api";
import { filterByQuery } from "@/lib/knowledge/search";
import { statusLabel } from "@/lib/knowledge/types";
import type { GeneralInfo } from "@/lib/knowledge/types";

const STATUS_OPTIONS = [
  { value: "ready", label: "Ready for AI" },
  { value: "draft", label: "Draft" },
];

const EMPTY = { title: "", content: "", status: "ready" };

export function GeneralTab({ autoCreate = false }: { autoCreate?: boolean } = {}) {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortValue>("recent");
  const debouncedQuery = useDebouncedValue(query);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<GeneralInfo | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data = [], isLoading } = useQuery({ queryKey: ["kb", "general"], queryFn: listGeneral });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["kb"] });

  const saveMutation = useMutation({
    mutationFn: () =>
      saveGeneral({
        ...(editing ? { id: editing.id } : {}),
        title: form.title.trim(),
        content: form.content.trim(),
        status: form.status,
      }),
    onSuccess: () => {
      toast.success(editing ? "Information updated" : "Information saved");
      setOpen(false);
      refresh();
    },
    onError: (error: Error) =>
      toast.error("Couldn't save", { description: error.message }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteKbItem("general", id),
    onSuccess: () => {
      toast.success("Deleted");
      refresh();
    },
    onError: (error: Error) => toast.error("Couldn't delete", { description: error.message }),
  });

  const filtered = useMemo(
    () =>
      sortItems(
        filterByQuery(data, debouncedQuery, (item) => [item.title, item.content]),
        sort,
        (item) => item.title,
        (item) => item.updated_at,
      ),
    [data, debouncedQuery, sort],
  );

  useEffect(() => {
    if (autoCreate) openCreate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoCreate]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY);
    setOpen(true);
  }

  function openEdit(item: GeneralInfo) {
    setEditing(item);
    setForm({ title: item.title, content: item.content, status: item.status });
    setOpen(true);
  }

  return (
    <div>
      <KbToolbar
        query={query}
        onQueryChange={setQuery}
        placeholder="Search general information…"
        onAdd={openCreate}
        sort={sort}
        onSortChange={setSort}
        resultCount={filtered.length}
        totalCount={data.length}
        addLabel="Add information"
      />

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((index) => (
            <Skeleton key={index} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No general information yet."
          description="Add details about your organization so ConversaAI can answer accurately."
          actionLabel="Add information"
          onAction={openCreate}
        />
      ) : filtered.length === 0 ? (
        <EmptyState icon={FileText} title="No entries match your search." />
      ) : (
        <PagedList
          items={filtered}
          render={(item) => (
            <KbCard
              key={item.id}
              title={item.title}
              body={item.content}
              badges={<KbBadge>{statusLabel(item.status)}</KbBadge>}
              onEdit={() => openEdit(item)}
              onDelete={() => setDeleteId(item.id)}
            />
          )}
        />
      )}

      <KbDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Edit information" : "Add information"}
        description="Share useful facts about your organization."
        saving={saveMutation.isPending}
        onSave={() => {
          if (!form.title.trim() || !form.content.trim()) {
            toast.error("Title and content are required");
            return;
          }
          saveMutation.mutate();
        }}
      >
        <TextInput
          label="Title"
          value={form.title}
          onChange={(value) => setForm({ ...form, title: value })}
          placeholder="About our company"
        />
        <TextAreaInput
          label="Content"
          value={form.content}
          onChange={(value) => setForm({ ...form, content: value })}
          placeholder="Tell ConversaAI what customers should know…"
          rows={6}
        />
        <SelectInput
          label="Status"
          value={form.status}
          onChange={(value) => setForm({ ...form, status: value })}
          options={STATUS_OPTIONS}
        />
      </KbDialog>

      <DeleteDialog
        open={deleteId !== null}
        onOpenChange={(next) => !next && setDeleteId(null)}
        label="this entry"
        onConfirm={() => {
          if (deleteId) deleteMutation.mutate(deleteId);
          setDeleteId(null);
        }}
      />
    </div>
  );
}
