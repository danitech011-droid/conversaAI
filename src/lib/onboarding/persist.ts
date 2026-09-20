import { supabase } from "@/integrations/supabase/client";
import { logAudit } from "@/lib/workspace/api";

import {
  DEFAULT_DRAFT,
  METADATA_KEY,
  STORAGE_PREFIX,
  type AssistantRole,
  type AssistantTone,
  type OnboardingDraft,
} from "./types";

function isRole(value: unknown): value is AssistantRole {
  return (
    value === "customer-support" ||
    value === "sales" ||
    value === "information" ||
    value === "receptionist" ||
    value === "custom"
  );
}

function isTone(value: unknown): value is AssistantTone {
  return (
    value === "professional" ||
    value === "friendly" ||
    value === "formal" ||
    value === "conversational"
  );
}

function parseDraft(raw: unknown): Partial<OnboardingDraft> {
  if (!raw || typeof raw !== "object") return {};
  const value = raw as Record<string, unknown>;
  const draft: Partial<OnboardingDraft> = {};
  if (typeof value["step"] === "number") draft.step = value["step"];
  if (typeof value["organizationName"] === "string") draft.organizationName = value["organizationName"];
  if (typeof value["website"] === "string") draft.website = value["website"];
  if (typeof value["organizationSize"] === "string") draft.organizationSize = value["organizationSize"];
  if (typeof value["country"] === "string") draft.country = value["country"];
  if (typeof value["industry"] === "string") draft.industry = value["industry"];
  if (Array.isArray(value["goals"])) {
    draft.goals = value["goals"].filter((item): item is string => typeof item === "string");
  }
  if (typeof value["assistantName"] === "string") draft.assistantName = value["assistantName"];
  if (isRole(value["assistantRole"])) draft.assistantRole = value["assistantRole"];
  if (isTone(value["tone"])) draft.tone = value["tone"];
  if (typeof value["welcomeMessage"] === "string") draft.welcomeMessage = value["welcomeMessage"];
  if (typeof value["customInstructions"] === "string") draft.customInstructions = value["customInstructions"];
  if (typeof value["knowledgeAdded"] === "boolean") draft.knowledgeAdded = value["knowledgeAdded"];
  if (typeof value["knowledgeSkipped"] === "boolean") draft.knowledgeSkipped = value["knowledgeSkipped"];
  if (value["firstChannel"] === "web" || value["firstChannel"] === "whatsapp" || value["firstChannel"] === null) {
    draft.firstChannel = value["firstChannel"];
  }
  if (typeof value["channelConnected"] === "boolean") draft.channelConnected = value["channelConnected"];
  if (typeof value["channelSkipped"] === "boolean") draft.channelSkipped = value["channelSkipped"];
  return draft;
}

function readLocal(userId: string): Partial<OnboardingDraft> {
  try {
    const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${userId}`);
    return raw ? parseDraft(JSON.parse(raw)) : {};
  } catch {
    return {};
  }
}

function writeLocal(userId: string, draft: OnboardingDraft) {
  try {
    window.localStorage.setItem(`${STORAGE_PREFIX}${userId}`, JSON.stringify(draft));
  } catch {
    /* quota / private mode — server copy is the source of truth */
  }
}

export type LoadedOnboarding = {
  draft: OnboardingDraft;
  logoPath: string | null;
  logoPreview: string | null;
  completed: boolean;
  businessEmail: string;
};

export async function loadOnboarding(): Promise<LoadedOnboarding> {
  const { data: userData, error } = await supabase.auth.getUser();
  if (error || !userData.user) throw new Error("Your session expired. Please sign in again.");
  const user = userData.user;

  const [{ data: profile }, { data: business }] = await Promise.all([
    supabase.from("profiles").select("onboarding_completed, email").eq("id", user.id).maybeSingle(),
    supabase.from("businesses").select("*").eq("owner_id", user.id).maybeSingle(),
  ]);

  const fromMeta = parseDraft(user.user_metadata?.[METADATA_KEY]);
  const fromLocal = readLocal(user.id);

  const draft: OnboardingDraft = {
    ...DEFAULT_DRAFT,
    organizationName: business?.company_name ?? "",
    website: business?.website ?? "",
    country: business?.country ?? "",
    industry: business?.industry ?? "",
    ...fromLocal,
    ...fromMeta,
  };

  if (!draft.assistantName && draft.organizationName) {
    draft.assistantName = draft.organizationName.split(/\s+/)[0] ?? "";
  }

  let logoPreview: string | null = null;
  if (business?.logo_url) {
    const { data: signed } = await supabase.storage
      .from("business-logos")
      .createSignedUrl(business.logo_url, 60 * 60);
    logoPreview = signed?.signedUrl ?? null;
  }

  return {
    draft,
    logoPath: business?.logo_url ?? null,
    logoPreview,
    completed: Boolean(profile?.onboarding_completed),
    businessEmail: business?.business_email ?? user.email ?? "",
  };
}

export async function saveOnboardingDraft(
  draft: OnboardingDraft,
  extras: { logoPath: string | null; markComplete?: boolean },
): Promise<void> {
  const { data: userData, error } = await supabase.auth.getUser();
  if (error || !userData.user) throw new Error("Your session expired. Please sign in again.");
  const user = userData.user;

  writeLocal(user.id, draft);

  const { data: existing } = await supabase
    .from("businesses")
    .select("id, business_email, phone, description, timezone, primary_color, secondary_color")
    .eq("owner_id", user.id)
    .maybeSingle();

  const { error: businessError } = await supabase.from("businesses").upsert(
    {
      owner_id: user.id,
      company_name: draft.organizationName.trim() || "My organisation",
      website: draft.website.trim() || null,
      country: draft.country || null,
      industry: draft.industry || null,
      logo_url: extras.logoPath,
      description: existing?.description ?? null,
      business_email: existing?.business_email ?? user.email ?? null,
      phone: existing?.phone ?? null,
      timezone: existing?.timezone ?? null,
      primary_color: existing?.primary_color ?? "#2563EB",
      secondary_color: existing?.secondary_color ?? "#06B6D4",
    },
    { onConflict: "owner_id" },
  );
  if (businessError) throw new Error(businessError.message);

  const { error: metaError } = await supabase.auth.updateUser({
    data: { [METADATA_KEY]: draft },
  });
  if (metaError) throw new Error(metaError.message);

  if (extras.markComplete) {
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ onboarding_completed: true })
      .eq("id", user.id);
    if (profileError) throw new Error(profileError.message);

    await logAudit({
      action: "onboarding.completed",
      area: "onboarding",
      summary: `${draft.organizationName || "Workspace"} onboarding completed`,
      metadata: {
        industry: draft.industry,
        goals: draft.goals,
        channel: draft.firstChannel,
        knowledge: draft.knowledgeAdded,
      },
    });
  }
}
