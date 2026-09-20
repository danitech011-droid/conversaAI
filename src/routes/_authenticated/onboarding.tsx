import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { AiSetupStep } from "@/components/onboarding/steps/AiSetupStep";
import { ChannelStep } from "@/components/onboarding/steps/ChannelStep";
import { FinishStep } from "@/components/onboarding/steps/FinishStep";
import { GoalsStep } from "@/components/onboarding/steps/GoalsStep";
import { IndustryStep } from "@/components/onboarding/steps/IndustryStep";
import { KnowledgeStep } from "@/components/onboarding/steps/KnowledgeStep";
import { OrganizationStep } from "@/components/onboarding/steps/OrganizationStep";
import { FullPageSpinner } from "@/components/ui/spinner";
import { supabase } from "@/integrations/supabase/client";
import { loadOnboarding, saveOnboardingDraft } from "@/lib/onboarding/persist";
import { DEFAULT_DRAFT, ONBOARDING_STEPS, type OnboardingDraft } from "@/lib/onboarding/types";
import {
  aiSetupSchema,
  fieldErrors,
  goalsSchema,
  industrySchema,
  organizationSchema,
} from "@/lib/onboarding/validation";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({
    meta: [
      { title: "Set up your workspace — ConversaAI" },
      {
        name: "description",
        content: "Tell ConversaAI about your organisation so we can prepare a personalised workspace.",
      },
      { property: "og:title", content: "Onboarding — ConversaAI" },
      { property: "og:description", content: "Create your organisation’s starting configuration." },
    ],
  }),
  component: OnboardingPage,
});

const STEP_COPY = [
  {
    title: "Let's get to know your organization",
    subtitle: "Tell us a little about your organization so we can personalize your ConversaAI workspace.",
  },
  {
    title: "What best describes your organization?",
    subtitle: "This helps ConversaAI personalize your workspace and recommend the right setup. You can change it later.",
  },
  {
    title: "What would you like ConversaAI to help with?",
    subtitle: "Choose everything you'd like your AI assistant to help you accomplish.",
  },
  {
    title: "Meet your AI assistant",
    subtitle: "Give your AI a name and personality that fits your organization.",
  },
  {
    title: "Help your AI understand your organization",
    subtitle: "Give ConversaAI the information it needs to provide useful and accurate answers. You can skip this and add knowledge later.",
  },
  {
    title: "Where should your AI start working?",
    subtitle: "Choose where you'd like to deploy ConversaAI first. You can connect additional channels later.",
  },
  {
    title: "Your AI is ready to meet you",
    subtitle: "Test your assistant before entering your workspace.",
  },
] as const;

function OnboardingPage() {
  const navigate = useNavigate();
  const [booting, setBooting] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [finished, setFinished] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [draft, setDraft] = useState<OnboardingDraft>(DEFAULT_DRAFT);
  const [logoPath, setLogoPath] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    loadOnboarding()
      .then((loaded) => {
        if (cancelled) return;
        setDraft(loaded.completed ? { ...loaded.draft, step: 0 } : loaded.draft);
        setLogoPath(loaded.logoPath);
        setLogoPreview(loaded.logoPreview);
        setBooting(false);
      })
      .catch((error: Error) => {
        if (cancelled) return;
        toast.error("Couldn't load onboarding", { description: error.message });
        setBooting(false);
      });

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  function patch<K extends keyof OnboardingDraft>(key: K, value: OnboardingDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key as string]) return current;
      const next = { ...current };
      delete next[key as string];
      return next;
    });
  }

  function validateStep(step: number): boolean {
    const schema =
      step === 0
        ? organizationSchema
        : step === 1
          ? industrySchema
          : step === 2
            ? goalsSchema
            : step === 3
              ? aiSetupSchema
              : null;
    if (!schema) {
      setErrors({});
      return true;
    }
    const parsed = schema.safeParse(draft);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return false;
    }
    setErrors({});
    return true;
  }

  async function persist(next: OnboardingDraft, markComplete = false) {
    await saveOnboardingDraft(next, { logoPath, markComplete });
  }

  async function goTo(step: number, extra?: Partial<OnboardingDraft>, markComplete = false) {
    const next: OnboardingDraft = { ...draft, ...extra, step };
    setDraft(next);
    setSaving(true);
    try {
      await persist(next, markComplete);
      if (markComplete) setFinished(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      toast.error("Couldn't save your progress", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleContinue() {
    if (finished) {
      navigate({ to: "/dashboard" });
      return;
    }
    if (!validateStep(draft.step)) return;

    const extra: Partial<OnboardingDraft> = {};
    if (draft.step === 0 && !draft.assistantName.trim()) {
      extra.assistantName = draft.organizationName.trim().split(/\s+/)[0] ?? "";
    }

    if (draft.step >= ONBOARDING_STEPS.length - 1) {
      await goTo(draft.step, extra, true);
      return;
    }
    await goTo(Math.min(draft.step + 1, ONBOARDING_STEPS.length - 1), extra);
  }

  async function handleLogo(file: File) {
    setUploading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) throw new Error("Your session expired.");
      const extension = file.name.split(".").pop() ?? "png";
      const path = `${user.id}/logo-${Date.now()}.${extension}`;
      const { error } = await supabase.storage
        .from("business-logos")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (error) throw error;
      const { data: signed } = await supabase.storage.from("business-logos").createSignedUrl(path, 60 * 60);
      setLogoPath(path);
      setLogoPreview(signed?.signedUrl ?? URL.createObjectURL(file));
      toast.success("Logo uploaded");
    } catch (error) {
      toast.error("Upload failed", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setUploading(false);
    }
  }

  if (booting) return <FullPageSpinner label="Preparing your workspace" />;

  const step = draft.step;
  const copy = finished
    ? { title: "You're ready", subtitle: "Your ConversaAI workspace is ready." }
    : (STEP_COPY[step] ?? STEP_COPY[0]);

  const skippable = !finished && (step === 4 || step === 5);

  return (
    <OnboardingShell
      current={finished ? ONBOARDING_STEPS.length - 1 : step}
      title={copy.title}
      subtitle={copy.subtitle}
      saving={saving || uploading}
      onBack={
        finished || step === 0
          ? undefined
          : () => {
              setErrors({});
              void goTo(Math.max(0, draft.step - 1));
            }
      }
      onSkip={
        skippable
          ? () => {
              if (step === 4) {
                void goTo(5, { knowledgeSkipped: !draft.knowledgeAdded });
              } else {
                void goTo(6, { channelSkipped: !draft.channelConnected });
              }
            }
          : undefined
      }
      onContinue={handleContinue}
      continueLabel={finished ? "Go to dashboard" : step === 6 ? "Finish setup" : "Continue"}
    >
      {finished || step === 6 ? (
        <FinishStep draft={draft} done={finished} />
      ) : step === 0 ? (
        <OrganizationStep
          draft={draft}
          errors={errors}
          logoPreview={logoPreview}
          uploading={uploading}
          onChange={patch}
          onLogo={handleLogo}
          onRemoveLogo={() => {
            setLogoPath(null);
            setLogoPreview(null);
          }}
        />
      ) : step === 1 ? (
        <IndustryStep value={draft.industry} error={errors["industry"]} onChange={(value) => patch("industry", value)} />
      ) : step === 2 ? (
        <GoalsStep
          selected={draft.goals}
          error={errors["goals"]}
          onToggle={(id) =>
            patch(
              "goals",
              draft.goals.includes(id) ? draft.goals.filter((item) => item !== id) : [...draft.goals, id],
            )
          }
        />
      ) : step === 3 ? (
        <AiSetupStep draft={draft} errors={errors} onChange={patch} />
      ) : step === 4 ? (
        <KnowledgeStep website={draft.website} onKnowledgeAdded={() => patch("knowledgeAdded", true)} />
      ) : (
        <ChannelStep
          website={draft.website}
          welcome={draft.welcomeMessage}
          selected={draft.firstChannel}
          connected={draft.channelConnected}
          onSelect={(value) => patch("firstChannel", value)}
          onConnected={(value) => {
            patch("firstChannel", value);
            patch("channelConnected", true);
            patch("channelSkipped", false);
          }}
        />
      )}
    </OnboardingShell>
  );
}
