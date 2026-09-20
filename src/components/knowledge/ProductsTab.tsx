import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Package } from "lucide-react";
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
import { deleteKbItem, listProducts, saveProduct, uploadKnowledgeImage } from "@/lib/knowledge/api";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { filterByQuery } from "@/lib/knowledge/search";
import { CURRENCIES, PRODUCT_AVAILABILITY, labelFor } from "@/lib/knowledge/types";
import type { Product } from "@/lib/knowledge/types";

const CURRENCY_OPTIONS = CURRENCIES.map((code) => ({ value: code, label: code }));

const EMPTY = {
  name: "",
  description: "",
  price: "",
  currency: "USD",
  availability: "in_stock",
  category: "",
  image_urls: [] as string[],
};

export function ProductsTab({ autoCreate = false }: { autoCreate?: boolean } = {}) {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortValue>("recent");
  const debouncedQuery = useDebouncedValue(query);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [uploading, setUploading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data = [], isLoading } = useQuery({ queryKey: ["kb", "products"], queryFn: listProducts });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["kb"] });
  };

  const saveMutation = useMutation({
    mutationFn: () =>
      saveProduct({
        ...(editing ? { id: editing.id } : {}),
        name: form.name.trim(),
        description: form.description.trim() || null,
        price: form.price ? Number(form.price) : null,
        currency: form.currency,
        availability: form.availability,
        category: form.category.trim() || null,
        image_urls: form.image_urls,
      }),
    onSuccess: () => {
      toast.success(editing ? "Product updated" : "Product added");
      setOpen(false);
      refresh();
    },
    onError: (error: Error) => toast.error("Couldn't save product", { description: error.message }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteKbItem("products", id),
    onSuccess: () => {
      toast.success("Product deleted");
      refresh();
    },
    onError: (error: Error) => toast.error("Couldn't delete", { description: error.message }),
  });

  const filtered = useMemo(
    () =>
      sortItems(
        filterByQuery(data, debouncedQuery, (product) => [
          product.name,
          product.description ?? "",
          product.category ?? "",
        ]),
        sort,
        (product) => product.name,
        (product) => product.updated_at,
      ),
    [data, debouncedQuery, sort],
  );

  async function handleFiles(files: FileList) {
    setUploading(true);
    try {
      const uploads = await Promise.all(
        Array.from(files).map((file) => uploadKnowledgeImage(file, "products")),
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

  function openEdit(product: Product) {
    setEditing(product);
    setForm({
      name: product.name,
      description: product.description ?? "",
      price: product.price?.toString() ?? "",
      currency: product.currency,
      availability: product.availability,
      category: product.category ?? "",
      image_urls: product.image_urls ?? [],
    });
    setOpen(true);
  }

  return (
    <div>
      <KbToolbar
        query={query}
        onQueryChange={setQuery}
        placeholder="Search products…"
        onAdd={openCreate}
        sort={sort}
        onSortChange={setSort}
        resultCount={filtered.length}
        totalCount={data.length}
        addLabel="Add product"
      />

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((index) => (
            <Skeleton key={index} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No products added yet."
          description="Add what you sell — names, prices and availability — so your assistant can recommend the right item."
          actionLabel="Add your first product"
          onAction={openCreate}
        />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Package} title="No products match your search." />
      ) : (
        <PagedList
          items={filtered}
          render={(product) => (
            <KbCard
              key={product.id}
              title={product.name}
              subtitle={
                product.price !== null ? `${product.currency} ${product.price}` : "Price on request"
              }
              body={product.description}
              images={product.image_urls}
              badges={
                <>
                  {product.category && <KbBadge>{product.category}</KbBadge>}
                  <KbBadge>{labelFor(PRODUCT_AVAILABILITY, product.availability)}</KbBadge>
                </>
              }
              onEdit={() => openEdit(product)}
              onDelete={() => setDeleteId(product.id)}
            />
          )}
        />
      )}

      <KbDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Edit product" : "Add product"}
        saving={saveMutation.isPending}
        onSave={() => {
          if (!form.name.trim()) {
            toast.error("Product name is required");
            return;
          }
          saveMutation.mutate();
        }}
      >
        <TextInput
          label="Product name"
          value={form.name}
          onChange={(value) => setForm({ ...form, name: value })}
        />
        <TextAreaInput
          label="Description"
          value={form.description}
          onChange={(value) => setForm({ ...form, description: value })}
        />
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
        <div className="grid grid-cols-2 gap-3">
          <SelectInput
            label="Availability"
            value={form.availability}
            onChange={(value) => setForm({ ...form, availability: value })}
            options={PRODUCT_AVAILABILITY}
          />
          <TextInput
            label="Category"
            value={form.category}
            onChange={(value) => setForm({ ...form, category: value })}
          />
        </div>
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
        label="this product"
        onConfirm={() => {
          if (deleteId) deleteMutation.mutate(deleteId);
          setDeleteId(null);
        }}
      />
    </div>
  );
}
