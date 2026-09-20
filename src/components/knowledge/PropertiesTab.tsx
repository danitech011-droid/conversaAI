import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Home } from "lucide-react";
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
import {
  deleteKbItem,
  listProperties,
  saveProperty,
  uploadKnowledgeImage,
} from "@/lib/knowledge/api";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { filterByQuery } from "@/lib/knowledge/search";
import {
  CURRENCIES,
  PROPERTY_STATUS,
  PROPERTY_TYPES,
  labelFor,
} from "@/lib/knowledge/types";
import type { Property } from "@/lib/knowledge/types";

const CURRENCY_OPTIONS = CURRENCIES.map((code) => ({ value: code, label: code }));
const TYPE_OPTIONS = PROPERTY_TYPES.map((type) => ({ value: type, label: type }));

const EMPTY = {
  title: "",
  property_type: "Villa",
  location: "",
  price: "",
  currency: "USD",
  bedrooms: "",
  bathrooms: "",
  area: "",
  description: "",
  features: "",
  image_urls: [] as string[],
  status: "available",
};

export function PropertiesTab({ autoCreate = false }: { autoCreate?: boolean } = {}) {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortValue>("recent");
  const debouncedQuery = useDebouncedValue(query);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Property | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [uploading, setUploading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data = [], isLoading } = useQuery({
    queryKey: ["kb", "properties"],
    queryFn: listProperties,
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["kb"] });
  };

  const saveMutation = useMutation({
    mutationFn: () =>
      saveProperty({
        ...(editing ? { id: editing.id } : {}),
        title: form.title.trim(),
        property_type: form.property_type,
        location: form.location.trim() || null,
        price: form.price ? Number(form.price) : null,
        currency: form.currency,
        bedrooms: form.bedrooms ? Number(form.bedrooms) : null,
        bathrooms: form.bathrooms ? Number(form.bathrooms) : null,
        area: form.area.trim() || null,
        description: form.description.trim() || null,
        features: form.features
          .split(",")
          .map((feature) => feature.trim())
          .filter(Boolean),
        image_urls: form.image_urls,
        status: form.status,
      }),
    onSuccess: () => {
      toast.success(editing ? "Property updated" : "Property added");
      setOpen(false);
      refresh();
    },
    onError: (error: Error) => toast.error("Couldn't save property", { description: error.message }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteKbItem("properties", id),
    onSuccess: () => {
      toast.success("Property deleted");
      refresh();
    },
    onError: (error: Error) => toast.error("Couldn't delete", { description: error.message }),
  });

  const filtered = useMemo(
    () =>
      sortItems(
        filterByQuery(data, debouncedQuery, (property) => [
          property.title,
          property.description ?? "",
          property.location ?? "",
          property.property_type ?? "",
          property.features.join(" "),
        ]),
        sort,
        (property) => property.title,
        (property) => property.updated_at,
      ),
    [data, debouncedQuery, sort],
  );

  async function handleFiles(files: FileList) {
    setUploading(true);
    try {
      const uploads = await Promise.all(
        Array.from(files).map((file) => uploadKnowledgeImage(file, "properties")),
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

  useEffect(() => {
    if (autoCreate) openCreate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoCreate]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY);
    setOpen(true);
  }

  function openEdit(property: Property) {
    setEditing(property);
    setForm({
      title: property.title,
      property_type: property.property_type ?? "Villa",
      location: property.location ?? "",
      price: property.price?.toString() ?? "",
      currency: property.currency,
      bedrooms: property.bedrooms?.toString() ?? "",
      bathrooms: property.bathrooms?.toString() ?? "",
      area: property.area ?? "",
      description: property.description ?? "",
      features: property.features.join(", "),
      image_urls: property.image_urls ?? [],
      status: property.status,
    });
    setOpen(true);
  }

  return (
    <div>
      <KbToolbar
        query={query}
        onQueryChange={setQuery}
        placeholder="Search properties…"
        onAdd={openCreate}
        sort={sort}
        onSortChange={setSort}
        resultCount={filtered.length}
        totalCount={data.length}
        addLabel="Add property"
      />

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((index) => (
            <Skeleton key={index} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <EmptyState
          icon={Home}
          title="No properties added yet."
          description="List your units with location, price and features so your assistant can match buyer requests."
          actionLabel="Add your first property"
          onAction={openCreate}
        />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Home} title="No properties match your search." />
      ) : (
        <PagedList
          items={filtered}
          render={(property) => (
            <KbCard
              key={property.id}
              title={property.title}
              subtitle={[
                property.location,
                property.price !== null ? `${property.currency} ${property.price}` : null,
              ]
                .filter(Boolean)
                .join(" · ")}
              body={property.description}
              images={property.image_urls}
              badges={
                <>
                  {property.property_type && <KbBadge>{property.property_type}</KbBadge>}
                  {property.bedrooms !== null && <KbBadge>{property.bedrooms} bed</KbBadge>}
                  {property.bathrooms !== null && <KbBadge>{property.bathrooms} bath</KbBadge>}
                  {property.area && <KbBadge>{property.area}</KbBadge>}
                  <KbBadge>{labelFor(PROPERTY_STATUS, property.status)}</KbBadge>
                </>
              }
              onEdit={() => openEdit(property)}
              onDelete={() => setDeleteId(property.id)}
            />
          )}
        />
      )}

      <KbDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Edit property" : "Add property"}
        saving={saveMutation.isPending}
        onSave={() => {
          if (!form.title.trim()) {
            toast.error("Property title is required");
            return;
          }
          saveMutation.mutate();
        }}
      >
        <TextInput
          label="Property title"
          value={form.title}
          onChange={(value) => setForm({ ...form, title: value })}
        />
        <div className="grid grid-cols-2 gap-3">
          <SelectInput
            label="Property type"
            value={form.property_type}
            onChange={(value) => setForm({ ...form, property_type: value })}
            options={TYPE_OPTIONS}
          />
          <TextInput
            label="Location"
            value={form.location}
            onChange={(value) => setForm({ ...form, location: value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <TextInput
            label="Price"
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
        <div className="grid grid-cols-3 gap-3">
          <TextInput
            label="Bedrooms"
            type="number"
            value={form.bedrooms}
            onChange={(value) => setForm({ ...form, bedrooms: value })}
          />
          <TextInput
            label="Bathrooms"
            type="number"
            value={form.bathrooms}
            onChange={(value) => setForm({ ...form, bathrooms: value })}
          />
          <TextInput
            label="Area"
            value={form.area}
            onChange={(value) => setForm({ ...form, area: value })}
            placeholder="220 m²"
          />
        </div>
        <TextAreaInput
          label="Description"
          value={form.description}
          onChange={(value) => setForm({ ...form, description: value })}
        />
        <TextInput
          label="Features (comma separated)"
          value={form.features}
          onChange={(value) => setForm({ ...form, features: value })}
          placeholder="Private pool, Sea view, Garage"
        />
        <SelectInput
          label="Status"
          value={form.status}
          onChange={(value) => setForm({ ...form, status: value })}
          options={PROPERTY_STATUS}
        />
        <ImageUploader
          images={form.image_urls}
          onChange={(images) => setForm({ ...form, image_urls: images })}
          uploading={uploading}
          onFiles={handleFiles}
        />
      </KbDialog>

      <DeleteDialog
        open={deleteId !== null}
        onOpenChange={(next) => !next && setDeleteId(null)}
        label="this property"
        onConfirm={() => {
          if (deleteId) deleteMutation.mutate(deleteId);
          setDeleteId(null);
        }}
      />
    </div>
  );
}
