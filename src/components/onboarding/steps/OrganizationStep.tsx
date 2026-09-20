import { TextField } from "@/components/form/Fields";
import { LogoUploader } from "@/components/onboarding/LogoUploader";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { COUNTRIES } from "@/lib/onboarding-options";
import { ORGANIZATION_SIZES } from "@/lib/onboarding/options";
import type { OnboardingDraft } from "@/lib/onboarding/types";

export function OrganizationStep({
  draft,
  errors,
  logoPreview,
  uploading,
  onChange,
  onLogo,
  onRemoveLogo,
}: {
  draft: OnboardingDraft;
  errors: Record<string, string>;
  logoPreview: string | null;
  uploading: boolean;
  onChange: <K extends keyof OnboardingDraft>(key: K, value: OnboardingDraft[K]) => void;
  onLogo: (file: File) => void;
  onRemoveLogo: () => void;
}) {
  return (
    <div className="space-y-5">
      <TextField
        label="Organization name"
        value={draft.organizationName}
        onChange={(event) => onChange("organizationName", event.target.value)}
        error={errors["organizationName"]}
        placeholder="Dani-Tech"
        maxLength={120}
        required
      />
      <TextField
        label="Website URL"
        type="url"
        value={draft.website}
        onChange={(event) => onChange("website", event.target.value)}
        error={errors["website"]}
        hint="Optional"
        placeholder="https://danitech.com"
        maxLength={255}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="org-size">Organization size</Label>
          <Select
            {...(draft.organizationSize ? { value: draft.organizationSize } : {})}
            onValueChange={(value) => onChange("organizationSize", value)}
          >
            <SelectTrigger id="org-size" className="h-11 w-full">
              <SelectValue placeholder="Select organization size" />
            </SelectTrigger>
            <SelectContent>
              {ORGANIZATION_SIZES.map((size) => (
                <SelectItem key={size.value} value={size.value}>
                  {size.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">Optional</p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="org-country">Country / Region</Label>
          <Select
            {...(draft.country ? { value: draft.country } : {})}
            onValueChange={(value) => onChange("country", value)}
          >
            <SelectTrigger id="org-country" className="h-11 w-full">
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((country) => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">Optional</p>
        </div>
      </div>

      <LogoUploader preview={logoPreview} uploading={uploading} onFile={onLogo} onRemove={onRemoveLogo} />
    </div>
  );
}
