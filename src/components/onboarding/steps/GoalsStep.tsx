import { SelectableCard } from "@/components/onboarding/SelectableCard";
import { GOAL_CARDS } from "@/lib/onboarding/options";

export function GoalsStep({
  selected,
  error,
  onToggle,
}: {
  selected: string[];
  error?: string | undefined;
  onToggle: (id: string) => void;
}) {
  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2">
        {GOAL_CARDS.map((goal) => (
          <SelectableCard
            key={goal.id}
            multiple
            title={goal.title}
            description={goal.description}
            icon={goal.icon}
            selected={selected.includes(goal.id)}
            onSelect={() => onToggle(goal.id)}
          />
        ))}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        {selected.length === 0 ? "Select at least one." : `${selected.length} selected`}
      </p>
      {error ? <p className="mt-1 text-xs font-medium text-destructive">{error}</p> : null}
    </div>
  );
}
