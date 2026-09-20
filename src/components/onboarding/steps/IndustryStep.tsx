import { SelectableCard } from "@/components/onboarding/SelectableCard";
import { INDUSTRY_CARDS } from "@/lib/onboarding/options";

export function IndustryStep({
  value,
  error,
  onChange,
}: {
  value: string;
  error?: string | undefined;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <div role="radiogroup" aria-label="Primary industry" className="grid gap-3 sm:grid-cols-2">
        {INDUSTRY_CARDS.map((industry) => (
          <SelectableCard
            key={industry.value}
            name="industry"
            title={industry.title}
            description={industry.description}
            icon={industry.icon}
            selected={value === industry.value}
            onSelect={() => onChange(industry.value)}
          />
        ))}
      </div>
      {error ? <p className="mt-3 text-xs font-medium text-destructive">{error}</p> : null}
    </div>
  );
}
