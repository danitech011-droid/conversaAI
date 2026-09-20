import { ImagePlus, Trash2, Upload } from "lucide-react";
import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

const MAX_BYTES = 2 * 1024 * 1024;

export function LogoUploader({
  preview,
  uploading,
  onFile,
  onRemove,
}: {
  preview: string | null;
  uploading: boolean;
  onFile: (file: File) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function accept(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Unsupported file", { description: "Please upload a PNG, JPG or SVG." });
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("File too large", { description: "Logos must be smaller than 2 MB." });
      return;
    }
    onFile(file);
  }

  function onInput(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    accept(file);
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    accept(event.dataTransfer.files?.[0]);
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="logo-upload">Organization logo</Label>
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed px-4 py-8 text-center transition-colors sm:flex-row sm:text-left",
          dragging ? "border-primary bg-primary/8" : "border-border bg-surface",
        )}
      >
        <span className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-border bg-background">
          {preview ? (
            <img src={preview} alt="Uploaded organisation logo" className="h-full w-full object-contain" />
          ) : (
            <ImagePlus className="h-6 w-6 text-muted-foreground" aria-hidden />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">
            {preview ? "Replace your logo" : "Upload a logo"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Drag and drop, or click to browse. PNG, JPG or SVG · 2 MB max.</p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <input
              ref={inputRef}
              id="logo-upload"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={onInput}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
            >
              {uploading ? <Spinner className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
              {preview ? "Replace" : "Upload logo"}
            </Button>
            {preview && !uploading ? (
              <Button type="button" variant="ghost" size="sm" className="gap-1.5" onClick={onRemove}>
                <Trash2 className="h-4 w-4" />
                Remove
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
