export const ONBOARDING_STEPS = [
  { id: "organization", label: "Organization" },
  { id: "industry", label: "Industry" },
  { id: "goals", label: "Goals" },
  { id: "ai", label: "AI Setup" },
  { id: "knowledge", label: "Knowledge" },
  { id: "channel", label: "First Channel" },
  { id: "finish", label: "Test & Finish" },
] as const;

export type OnboardingStepId = (typeof ONBOARDING_STEPS)[number]["id"];

export type AssistantRole =
  | "customer-support"
  | "sales"
  | "information"
  | "receptionist"
  | "custom";

export type AssistantTone = "professional" | "friendly" | "formal" | "conversational";

export type FirstChannel = "web" | "whatsapp" | null;

export type OnboardingDraft = {
  step: number;
  organizationName: string;
  website: string;
  organizationSize: string;
  country: string;
  industry: string;
  goals: string[];
  assistantName: string;
  assistantRole: AssistantRole;
  tone: AssistantTone;
  welcomeMessage: string;
  customInstructions: string;
  knowledgeAdded: boolean;
  knowledgeSkipped: boolean;
  firstChannel: FirstChannel;
  channelConnected: boolean;
  channelSkipped: boolean;
};

export const DEFAULT_DRAFT: OnboardingDraft = {
  step: 0,
  organizationName: "",
  website: "",
  organizationSize: "",
  country: "",
  industry: "",
  goals: [],
  assistantName: "",
  assistantRole: "customer-support",
  tone: "professional",
  welcomeMessage: "Hi! 👋 How can I help you today?",
  customInstructions: "",
  knowledgeAdded: false,
  knowledgeSkipped: false,
  firstChannel: null,
  channelConnected: false,
  channelSkipped: false,
};

export const METADATA_KEY = "conversa_onboarding";
export const STORAGE_PREFIX = "conversaai-onboarding:";
