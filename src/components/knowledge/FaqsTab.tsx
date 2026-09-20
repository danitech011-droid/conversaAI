import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { HelpCircle } from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/dashboard/EmptyState";
import {
  DeleteDialog,
  KbBadge,
  KbCard,
  KbDialog,
  KbToolbar,
  PagedList,
  sortItems,
  type SortValue,
  SelectInput,
  TextAreaInput,
  TextInput,
} from "@/components/knowledge/kb-ui";
import { Skeleton } from "@/components/ui/skeleton";
import { deleteKbItem, listFaqs, saveFaq } from "@/lib/knowledge/api";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { filterByQuery } from "@/lib/knowledge/search";
import type { Faq } from "@/lib/knowledge/types";

const STATUS_OPTIONS = [
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
];

const EMPTY = { question: "", answer: "", category: "", status: "published" };

export function FaqsTab({ autoCreate = false }: { autoCreate?: boolean } = {}) {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortValue>("recent");
  const debouncedQuery = useDebouncedValue(query);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Faq | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data = [], isLoading } = useQuery({ queryKey: ["kb", "faqs"], queryFn: listFaqs });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["kb"] });
  };

  const saveMutation = useMutation({
    mutationFn: () =>
      saveFaq({
        ...(editing ? { id: editing.id } : {}),
        question: form.question.trim(),
        answer: form.answer.trim(),
        category: form.category.trim() || null,
        status: form.status,
      }),
    onSuccess: () => {
      toast.success(editing ? "FAQ updated" : "FAQ added");
      setOpen(false);
      refresh();
    },
    onError: (error: Error) => toast.error("Couldn't save FAQ", { description: error.message }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteKbItem("faqs", id),
    onSuccess: () => {
      toast.success("FAQ deleted");
      refresh();
    },
    onError: (error: Error) => toast.error("Couldn't delete", { description: error.message }),
  });

  const filtered = useMemo(
    () =>
      sortItems(
        filterByQuery(data, debouncedQuery, (faq) => [
          faq.question,
          faq.answer,
          faq.category ?? "",
        ]),
        sort,
        (faq) => faq.question,
        (faq) => faq.updated_at,
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

  function openEdit(faq: Faq) {
    setEditing(faq);
    setForm({
      question: faq.question,
      answer: faq.answer,
      category: faq.category ?? "",
      status: faq.status,
    });
    setOpen(true);
  }

  function handleSave() {
    if (!form.question.trim() || !form.answer.trim()) {
      toast.error("Question and answer are required");
      return;
    }
    saveMutation.mutate();
  }

  return (
    <div>
      <KbToolbar
        query={query}
        onQueryChange={setQuery}
        placeholder="Search FAQs…"
        onAdd={openCreate}
        sort={sort}
        onSortChange={setSort}
        resultCount={filtered.length}
        totalCount={data.length}
        addLabel="Add FAQ"
      />

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((index) => (
            <Skeleton key={index} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <EmptyState
          icon={HelpCircle}
          title="No FAQs added yet."
          description="Answer the questions your customers ask most so your future AI assistant can respond instantly."
          actionLabel="Add your first FAQ"
          onAction={openCreate}
        />
      ) : filtered.length === 0 ? (
        <EmptyState icon={HelpCircle} title="No FAQs match your search." />
      ) : (
        <PagedList
          items={filtered}
          render={(faq) => (
            <KbCard
              key={faq.id}
              title={faq.question}
              body={faq.answer}
              badges={
                <>
                  {faq.category && <KbBadge>{faq.category}</KbBadge>}
                  <KbBadge>{faq.status === "draft" ? "Draft" : "Published"}</KbBadge>
                </>
              }
              onEdit={() => openEdit(faq)}
              onDelete={() => setDeleteId(faq.id)}
            />
          )}
        />
      )}

      <KbDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Edit FAQ" : "Add FAQ"}
        description="Questions and answers your assistant can quote directly."
        saving={saveMutation.isPending}
        onSave={handleSave}
      >
        <TextInput
          label="Question"
          value={form.question}
          onChange={(value) => setForm({ ...form, question: value })}
          placeholder="Do you offer refunds?"
        />
        <TextAreaInput
          label="Answer"
          value={form.answer}
          onChange={(value) => setForm({ ...form, answer: value })}
          placeholder="Yes — within 30 days of purchase."
        />
        <TextInput
          label="Category"
          value={form.category}
          onChange={(value) => setForm({ ...form, category: value })}
          placeholder="Billing"
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
        label="this FAQ"
        onConfirm={() => {
          if (deleteId) deleteMutation.mutate(deleteId);
          setDeleteId(null);
        }}
      />
    </div>
  );
}
