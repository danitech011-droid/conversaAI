import { useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Loader2, Pencil, Plus, Search, Trash2, X } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

/* ------------------------------ form fields ------------------------------ */

export function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string | undefined;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

export function TextInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  className?: string | undefined;
}) {
  return (
    <Field label={label} className={className}>
      <Input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </Field>
  );
}

export function TextAreaInput({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <Field label={label}>
      <Textarea
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </Field>
  );
}

export function SelectInput({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly { value: string; label: string }[];
}) {
  return (
    <Field label={label}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}

/* --------------------------------- shell --------------------------------- */

export const SORT_OPTIONS = [
  { value: "recent", label: "Recently updated" },
  { value: "oldest", label: "Oldest first" },
  { value: "az", label: "A → Z" },
  { value: "za", label: "Z → A" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];

export function sortItems<T>(
  items: T[],
  sort: SortValue,
  label: (item: T) => string,
  updatedAt: (item: T) => string,
): T[] {
  const copy = [...items];
  switch (sort) {
    case "az":
      return copy.sort((a, b) => label(a).localeCompare(label(b)));
    case "za":
      return copy.sort((a, b) => label(b).localeCompare(label(a)));
    case "oldest":
      return copy.sort(
        (a, b) => new Date(updatedAt(a)).getTime() - new Date(updatedAt(b)).getTime(),
      );
    default:
      return copy.sort(
        (a, b) => new Date(updatedAt(b)).getTime() - new Date(updatedAt(a)).getTime(),
      );
  }
}

export function KbToolbar({
  query,
  onQueryChange,
  placeholder,
  onAdd,
  addLabel,
  sort,
  onSortChange,
  resultCount,
  totalCount,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  placeholder: string;
  onAdd: () => void;
  addLabel: string;
  sort?: SortValue;
  onSortChange?: (value: SortValue) => void;
  resultCount?: number;
  totalCount?: number;
}) {
  return (
    <div className="mb-5 space-y-2">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={placeholder}
            className="h-11 pl-9 pr-9"
          />
          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => onQueryChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {sort && onSortChange && (
          <Select value={sort} onValueChange={(value) => onSortChange(value as SortValue)}>
            <SelectTrigger className="h-11 w-full sm:w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Button className="h-11 gap-2" onClick={onAdd}>
          <Plus className="h-4 w-4" />
          {addLabel}
        </Button>
      </div>
      {typeof resultCount === "number" && typeof totalCount === "number" && totalCount > 0 && (
        <p className="text-xs text-muted-foreground">
          {query.trim()
            ? `${resultCount} of ${totalCount} matching “${query.trim()}”`
            : `${totalCount} entr${totalCount === 1 ? "y" : "ies"}`}
        </p>
      )}
    </div>
  );
}


export function KbCard({
  title,
  subtitle,
  badges,
  body,
  images,
  onEdit,
  onDelete,
}: {
  title: string;
  subtitle?: string | null;
  badges?: ReactNode;
  body?: string | null;
  images?: string[];
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <article className="animate-fade-in rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-card)]">
      <div className="flex items-start gap-4">
        {images && images.length > 0 && (
          <img
            src={images[0]}
            alt={title}
            loading="lazy"
            className="h-16 w-16 shrink-0 rounded-lg border border-border object-cover"
          />
        )}
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-foreground">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
          {body && (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {body}
            </p>
          )}
          {badges && <div className="mt-3 flex flex-wrap gap-1.5">{badges}</div>}
        </div>
        <div className="flex shrink-0 gap-1">
          <Button variant="ghost" size="icon" aria-label="Edit" onClick={onEdit}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Delete" onClick={onDelete}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>
    </article>
  );
}

export function KbBadge({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-border bg-surface px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
      {children}
    </span>
  );
}

export function KbDialog({
  open,
  onOpenChange,
  title,
  description,
  saving,
  onSave,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  saving: boolean;
  onSave: () => void;
  children: ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="space-y-4 py-2">{children}</div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={saving} className="gap-2">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  label,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  label: string;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this knowledge?</AlertDialogTitle>
          <AlertDialogDescription>
            This information will no longer be available to ConversaAI. This action can&apos;t be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

const PAGE_SIZES = [5, 8, 12, 24];

/** Paginated list wrapper with page numbers and a page-size control. */
export function PagedList<T>({
  items,
  pageSize: initialPageSize = 8,
  render,
}: {
  items: T[];
  pageSize?: number;
  render: (item: T) => ReactNode;
}) {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const current = Math.min(page, pageCount - 1);
  const start = current * pageSize;
  const visible = items.slice(start, start + pageSize);

  const pages = Array.from({ length: pageCount }, (_, index) => index).filter(
    (index) => index === 0 || index === pageCount - 1 || Math.abs(index - current) <= 1,
  );

  return (
    <div className="space-y-3">
      {visible.map((item) => render(item))}

      {items.length > PAGE_SIZES[0]! && (
        <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Showing {start + 1}–{Math.min(start + pageSize, items.length)} of {items.length}
            </span>
            <Select
              value={String(pageSize)}
              onValueChange={(value) => {
                setPageSize(Number(value));
                setPage(0);
              }}
            >
              <SelectTrigger className="h-8 w-[92px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZES.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size} / page
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {pageCount > 1 && (
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                aria-label="Previous page"
                disabled={current === 0}
                onClick={() => setPage(current - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {pages.map((index, position) => (
                <span key={index} className="flex items-center gap-1">
                  {position > 0 && index - pages[position - 1]! > 1 && (
                    <span className="px-1 text-xs text-muted-foreground">…</span>
                  )}
                  <Button
                    variant={index === current ? "default" : "outline"}
                    size="icon"
                    className="h-8 w-8 text-xs"
                    aria-label={`Page ${index + 1}`}
                    aria-current={index === current ? "page" : undefined}
                    onClick={() => setPage(index)}
                  >
                    {index + 1}
                  </Button>
                </span>
              ))}
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                aria-label="Next page"
                disabled={current >= pageCount - 1}
                onClick={() => setPage(current + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


/** Simple multi-image uploader used by products and properties. */
export function ImageUploader({
  images,
  onChange,
  uploading,
  onFiles,
}: {
  images: string[];
  onChange: (images: string[]) => void;
  uploading: boolean;
  onFiles: (files: FileList) => void;
}) {
  return (
    <Field label="Images">
      <div className="flex flex-wrap gap-2">
        {images.map((url) => (
          <div key={url} className="relative">
            <img
              src={url}
              alt=""
              className="h-16 w-16 rounded-lg border border-border object-cover"
            />
            <button
              type="button"
              onClick={() => onChange(images.filter((item) => item !== url))}
              aria-label="Remove image"
              className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground"
            >
              ×
            </button>
          </div>
        ))}
        <label className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(event) => {
              if (event.target.files?.length) onFiles(event.target.files);
              event.target.value = "";
            }}
          />
        </label>
      </div>
    </Field>
  );
}
