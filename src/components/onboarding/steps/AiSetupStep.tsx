import { AssistantPreview } from "@/components/onboarding/AssistantPreview";
import { TextField } from "@/components/form/Fields";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ASSISTANT_ROLES, ASSISTANT_TONES } from "@/lib/onboarding/options";
import type { AssistantRole, AssistantTone, OnboardingDraft } from "@/lib/onboarding/types";

export function AiSetupStep({
  draft,
  errors,
  onChange,
}: {
  draft: OnboardingDraft;
  errors: Record<string, string>;
  onChange: <K extends keyof OnboardingDraft>(key: K, value: OnboardingDraft[K]) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_240px] lg:items-start">
        <div className="space-y-5">
          <TextField
            label="Assistant name"
            value={draft.assistantName}
            onChange={(event) => onChange("assistantName", event.target.value)}
            error={errors["assistantName"]}
            placeholder="Dani"
            maxLength={40}
          />

          <div className="space-y-1.5">
            <Label htmlFor="assistant-role">Assistant role</Label>
            <Select
              value={draft.assistantRole}
              onValueChange={(value) => onChange("assistantRole", value as AssistantRole)}
            >
              <SelectTrigger id="assistant-role" className="h-11 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ASSISTANT_ROLES.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="assistant-tone">AI personality / tone</Label>
            <Select value={draft.tone} onValueChange={(value) => onChange("tone", value as AssistantTone)}>
              <SelectTrigger id="assistant-tone" className="h-11 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ASSISTANT_TONES.map((tone) => (
                  <SelectItem key={tone.value} value={tone.value}>
                    {tone.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <AssistantPreview
          name={draft.assistantName}
          role={draft.assistantRole}
          welcome={draft.welcomeMessage}
          className="lg:sticky lg:top-4"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="welcome">Welcome message</Label>
        <Textarea
          id="welcome"
          rows={3}
          maxLength={280}
          value={draft.welcomeMessage}
          aria-invalid={Boolean(errors["welcomeMessage"])}
          onChange={(event) => onChange("welcomeMessage", event.target.value)}
          placeholder="Hi! 👋 How can I help you today?"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          {errors["welcomeMessage"] ? (
            <p className="font-medium text-destructive">{errors["welcomeMessage"]}</p>
          ) : (
            <p>Shown when a conversation starts.</p>
          )}
          <p>{draft.welcomeMessage.length}/280</p>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="instructions">Custom instructions</Label>
        <Textarea
          id="instructions"
          rows={4}
          maxLength={800}
          value={draft.customInstructions}
          onChange={(event) => onChange("customInstructions", event.target.value)}
          placeholder="Always be helpful and professional. If information is unavailable, offer to connect the customer with our team."
        />
        <p className="text-xs text-muted-foreground">Optional. You can refine this later in settings.</p>
      </div>
    </div>
  );
}
