import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ImageIcon } from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/dashboard/EmptyState";
import {
  DeleteDialog,
  Field,
  KbBadge,
  KbCard,
  KbDialog,
  KbToolbar,
  PagedList,
  TextAreaInput,
  TextInput,
  sortItems,
  type SortValue,
} from "@/components/knowledge/kb-ui";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { deleteKbItem, listImages, saveImage, uploadKnowledgeImage } from "@/lib/knowledge/api";
import { filterByQuery } from "@/lib/knowledge/search";
import { statusLabel } from "@/lib/knowledge/types";
import type { KnowledgeImage } from "@/lib/knowledge/types";

const EMPTY = { title: "", caption: "", image_url: "", storage_path: "", status: "ready" };

export function ImagesTab({ autoCreate = false }: { autoCreate?: boolean } = {}) {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortValue>("recent");
  const debouncedQuery = useDebouncedValue(query);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<KnowledgeImage | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [uploading, setUploading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data = [], isLoading } = useQuery({ queryKey: ["kb", "images"], queryFn: listImages });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["kb"] });

  const saveMutation = useMutation({
    mutationFn: () =>
      saveImage({
        ...(editing ? { id: editing.id } : {}),
        title: form.title.trim(),
        caption: form.caption.trim() || null,
        image_url: form.image_url,
        storage_path: form.storage_path,
        status: form.status,
      }),
    onSuccess: () => {
      toast.success(editing ? "Image updated" : "Image uploaded");
      setOpen(false);
      refresh();
    },
    onError: (error: Error) => toast.error("Couldn't save", { description: error.message }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteKbItem("images", id),
    onSuccess: () => {
      toast.success("Image deleted");
      refresh();
    },
    onError: (error: Error) => toast.error("Couldn't delete", { description: error.message }),
  });

  const filtered = useMemo(
    () =>
      sortItems(
        filterByQuery(data, debouncedQuery, (item) => [item.title, item.caption ?? ""]),
        sort,
        (item) => item.title || "Untitled image",
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

  function openEdit(item: KnowledgeImage) {
    setEditing(item);
    setForm({
      title: item.title,
      caption: item.caption ?? "",
      image_url: item.image_url,
      storage_path: item.storage_path,
      status: item.status,
    });
    setOpen(true);
  }

  async function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be smaller than 2 MB");
      return;
    }
    setUploading(true);
    try {
      const upload = await uploadKnowledgeImage(file, "knowledge-images");
      setForm((current) => ({
        ...current,
        image_url: upload.url,
        storage_path: upload.path,
        title: current.title || file.name.replace(/\.[^.]+$/, ""),
      }));
    } catch (error) {
      toast.error("Upload failed", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <KbToolbar
        query={query}
        onQueryChange={setQuery}
        placeholder="Search images…"
        onAdd={openCreate}
        sort={sort}
        onSortChange={setSort}
        resultCount={filtered.length}
        totalCount={data.length}
        addLabel="Upload image"
      />

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((index) => (
            <Skeleton key={index} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <EmptyState
          icon={ImageIcon}
          title="No images uploaded yet."
          description="Add product, service, or organization images for your AI to reference."
          actionLabel="Upload image"
          onAction={openCreate}
        />
      ) : filtered.length === 0 ? (
        <EmptyState icon={ImageIcon} title="No images match your search." />
      ) : (
        <PagedList
          items={filtered}
          render={(item) => (
            <KbCard
              key={item.id}
              title={item.title || "Untitled image"}
              body={item.caption}
              images={[item.image_url]}
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
        title={editing ? "Edit image" : "Upload image"}
        description="Images are stored securely and scoped to your organization."
        saving={saveMutation.isPending || uploading}
        onSave={() => {
          if (!form.image_url) {
            toast.error("Please upload an image");
            return;
          }
          saveMutation.mutate();
        }}
      >
        <Field label="Image">
          <div className="space-y-3">
            {form.image_url ? (
              <div className="relative w-fit">
                <img
                  src={form.image_url}
                  alt=""
                  className="h-32 w-32 rounded-xl border border-border object-cover"
                />
                <button
                  type="button"
                  onClick={() => setForm((current) => ({ ...current, image_url: "", storage_path: "" }))}
                  className="absolute -right-2 -top-2 rounded-full bg-destructive px-2 py-0.5 text-xs text-destructive-foreground"
                >
                  Remove
                </button>
              </div>
            ) : (
              <label
                className="flex h-32 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  handleFiles(event.dataTransfer.files);
                }}
              >
                {uploading ? "Uploading…" : "Click or drop an image"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    handleFiles(event.target.files);
                    event.target.value = "";
                  }}
                />
              </label>
            )}
          </div>
        </Field>
        <TextInput
          label="Title"
          value={form.title}
          onChange={(value) => setForm({ ...form, title: value })}
          placeholder="Product photo"
        />
        <TextAreaInput
          label="Caption (optional)"
          value={form.caption}
          onChange={(value) => setForm({ ...form, caption: value })}
          placeholder="What should ConversaAI know about this image?"
        />
      </KbDialog>

      <DeleteDialog
        open={deleteId !== null}
        onOpenChange={(next) => !next && setDeleteId(null)}
        label="this image"
        onConfirm={() => {
          if (deleteId) deleteMutation.mutate(deleteId);
          setDeleteId(null);
        }}
      />
    </div>
  );
}
