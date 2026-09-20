import { Label } from "@/components/ui/label";
import { BRAND_COLOR_SWATCHES } from "@/lib/onboarding-options";
import { cn } from "@/lib/utils";

type ColorPickerProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  id: string;
};

export function ColorPicker({ label, value, onChange, id }: ColorPickerProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-3">
        <input
          id={id}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 w-14 cursor-pointer rounded-lg border border-border bg-background p-1"
        />
        <input
          type="text"
          value={value.toUpperCase()}
          onChange={(e) => onChange(e.target.value)}
          aria-label={`${label} hex value`}
          maxLength={7}
          className="h-11 w-28 rounded-lg border border-border bg-background px-3 font-mono text-sm uppercase"
        />
      </div>
      <div className="flex flex-wrap gap-2 pt-1">
        {BRAND_COLOR_SWATCHES.map((swatch) => (
          <button
            key={swatch}
            type="button"
            onClick={() => onChange(swatch)}
            aria-label={`Use ${swatch}`}
            aria-pressed={value.toUpperCase() === swatch}
            className={cn(
              "h-7 w-7 rounded-full border-2 transition-transform hover:scale-110",
              value.toUpperCase() === swatch ? "border-foreground" : "border-border",
            )}
            style={{ backgroundColor: swatch }}
          />
        ))}
      </div>
    </div>
  );
}
