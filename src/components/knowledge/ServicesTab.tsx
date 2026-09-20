import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Wrench } from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/dashboard/EmptyState";
import {
  DeleteDialog,
  ImageUploader,
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
import { deleteKbItem, listServices, saveService, uploadKnowledgeImage } from "@/lib/knowledge/api";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { filterByQuery } from "@/lib/knowledge/search";
import { CURRENCIES, SERVICE_AVAILABILITY, labelFor } from "@/lib/knowledge/types";
import type { Service } from "@/lib/knowledge/types";

const CURRENCY_OPTIONS = CURRENCIES.map((code) => ({ value: code, label: code }));

const EMPTY = {
  name: "",
  description: "",
  duration: "",
  price: "",
  currency: "USD",
  availability: "available",
  category: "",
  image_urls: [] as string[],
};

export function ServicesTab({ autoCreate = false }: { autoCreate?: boolean } = {}) {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortValue>("recent");
  const debouncedQuery = useDebouncedValue(query);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [uploading, setUploading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data = [], isLoading } = useQuery({ queryKey: ["kb", "services"], queryFn: listServices });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["kb"] });
  };

  const saveMutation = useMutation({
    mutationFn: () =>
      saveService({
        ...(editing ? { id: editing.id } : {}),
        name: form.name.trim(),
        description: form.description.trim() || null,
        duration: form.duration.trim() || null,
        price: form.price ? Number(form.price) : null,
        currency: form.currency,
        availability: form.availability,
        category: form.category.trim() || null,
        image_urls: form.image_urls,
      }),
    onSuccess: () => {
      toast.success(editing ? "Service updated" : "Service added");
      setOpen(false);
      refresh();
    },
    onError: (error: Error) => toast.error("Couldn't save service", { description: error.message }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteKbItem("services", id),
    onSuccess: () => {
      toast.success("Service deleted");
      refresh();
    },
    onError: (error: Error) => toast.error("Couldn't delete", { description: error.message }),
  });

  const filtered = useMemo(
    () =>
      sortItems(
        filterByQuery(data, debouncedQuery, (service) => [
          service.name,
          service.description ?? "",
          service.duration ?? "",
        ]),
        sort,
        (service) => service.name,
        (service) => service.updated_at,
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

  function openEdit(service: Service) {
    setEditing(service);
    setForm({
      name: service.name,
      description: service.description ?? "",
      duration: service.duration ?? "",
      price: service.price?.toString() ?? "",
      currency: service.currency,
      availability: service.availability,
      category: service.category ?? "",
      image_urls: service.image_urls ?? [],
    });
    setOpen(true);
  }

  async function handleImageFiles(files: FileList) {
    setUploading(true);
    try {
      const uploads = await Promise.all(
        Array.from(files).map((file) => uploadKnowledgeImage(file, "services")),
      );
      setForm((current) => ({
        ...current,
        image_urls: [...current.image_urls, ...uploads.map((item) => item.url)],
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
        placeholder="Search services…"
        onAdd={openCreate}
        sort={sort}
        onSortChange={setSort}
        resultCount={filtered.length}
        totalCount={data.length}
        addLabel="Add service"
      />

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((index) => (
            <Skeleton key={index} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="No services added yet."
          description="Describe what you do, how long it takes and what it costs."
          actionLabel="Add your first service"
          onAction={openCreate}
        />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Wrench} title="No services match your search." />
      ) : (
        <PagedList
          items={filtered}
          render={(service) => (
            <KbCard
              key={service.id}
              title={service.name}
              subtitle={
                service.price !== null ? `${service.currency} ${service.price}` : "Price on request"
              }
              body={service.description}
              images={service.image_urls}
              badges={
                <>
                  {service.category ? <KbBadge>{service.category}</KbBadge> : null}
                  {service.duration ? <KbBadge>{service.duration}</KbBadge> : null}
                  <KbBadge>{labelFor(SERVICE_AVAILABILITY, service.availability)}</KbBadge>
                </>
              }
              onEdit={() => openEdit(service)}
              onDelete={() => setDeleteId(service.id)}
            />
          )}
        />
      )}

      <KbDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Edit service" : "Add service"}
        saving={saveMutation.isPending}
        onSave={() => {
          if (!form.name.trim()) {
            toast.error("Service name is required");
            return;
          }
          saveMutation.mutate();
        }}
      >
        <TextInput
          label="Service name"
          value={form.name}
          onChange={(value) => setForm({ ...form, name: value })}
        />
        <TextAreaInput
          label="Description"
          value={form.description}
          onChange={(value) => setForm({ ...form, description: value })}
        />
        <TextInput
          label="Estimated duration"
          value={form.duration}
          onChange={(value) => setForm({ ...form, duration: value })}
          placeholder="45 minutes"
        />
        <div className="grid grid-cols-2 gap-3">
          <TextInput
            label="Price (optional)"
            type="number"
            value={form.price}
            onChange={(value) => setForm({ ...form, price: value })}
          />
          <SelectInput
            label="Currency"
            value={form.currency}
            onChange={(value) => setForm({ ...form, currency: value })}
            options={CURRENCY_OPTIONS}
          />
        </div>
        <TextInput
          label="Category"
          value={form.category}
          onChange={(value) => setForm({ ...form, category: value })}
          placeholder="Consulting"
        />
        <ImageUploader
          images={form.image_urls}
          onChange={(image_urls) => setForm({ ...form, image_urls })}
          uploading={uploading}
          onFiles={handleImageFiles}
        />
        <SelectInput
          label="Availability"
          value={form.availability}
          onChange={(value) => setForm({ ...form, availability: value })}
          options={SERVICE_AVAILABILITY}
        />
      </KbDialog>

      <DeleteDialog
        open={deleteId !== null}
        onOpenChange={(next) => !next && setDeleteId(null)}
        label="this service"
        onConfirm={() => {
          if (deleteId) deleteMutation.mutate(deleteId);
          setDeleteId(null);
        }}
      />
    </div>
  );
}
