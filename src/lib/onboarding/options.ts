import {
  BookOpen,
  Building2,
  CalendarCheck,
  GraduationCap,
  Handshake,
  HeartPulse,
  HelpCircle,
  Home,
  Info,
  Landmark,
  MessageCircleQuestion,
  Repeat,
  Search,
  ShoppingBag,
  Sparkles,
  Target,
  Users,
} from "lucide-react";

export const ORGANIZATION_SIZES = [
  { value: "1-10", label: "1–10 people" },
  { value: "11-50", label: "11–50 people" },
  { value: "51-200", label: "51–200 people" },
  { value: "201-1000", label: "201–1,000 people" },
  { value: "1000+", label: "1,000+ people" },
] as const;

export const INDUSTRY_CARDS = [
  {
    value: "Business / Company",
    title: "Business / Company",
    description: "A company serving customers, clients or partners.",
    icon: Building2,
  },
  {
    value: "Real Estate",
    title: "Real Estate",
    description: "Property listings, viewings and buyer or tenant questions.",
    icon: Home,
  },
  {
    value: "Education",
    title: "Education",
    description: "Schools, courses and student or parent enquiries.",
    icon: GraduationCap,
  },
  {
    value: "Software & Technology",
    title: "Software & Technology",
    description: "SaaS, apps and technical product support.",
    icon: Sparkles,
  },
  {
    value: "E-commerce",
    title: "E-commerce",
    description: "Online stores, orders, shipping and product questions.",
    icon: ShoppingBag,
  },
  {
    value: "Healthcare",
    title: "Healthcare",
    description: "Clinics, practices and patient information.",
    icon: HeartPulse,
  },
  {
    value: "Non-profit / Organization",
    title: "Non-profit / Organization",
    description: "Missions, programmes and community support.",
    icon: Landmark,
  },
  {
    value: "Other",
    title: "Other",
    description: "Something else — we will still personalise around you.",
    icon: HelpCircle,
  },
] as const;

export const GOAL_CARDS = [
  {
    id: "answer-questions",
    title: "Answer customer questions",
    description: "Give accurate replies from your organisation’s knowledge.",
    icon: MessageCircleQuestion,
  },
  {
    id: "handle-enquiries",
    title: "Handle customer enquiries",
    description: "Qualify incoming requests and route what needs a person.",
    icon: Handshake,
  },
  {
    id: "product-info",
    title: "Provide product or service information",
    description: "Explain what you offer, pricing and availability.",
    icon: Info,
  },
  {
    id: "capture-leads",
    title: "Generate and capture leads",
    description: "Collect interest so your team can follow up.",
    icon: Target,
  },
  {
    id: "customer-support",
    title: "Provide customer support",
    description: "Help with issues, policies and next steps.",
    icon: Users,
  },
  {
    id: "schedule",
    title: "Schedule appointments or bookings",
    description: "Help people book time with your team.",
    icon: CalendarCheck,
  },
  {
    id: "find-information",
    title: "Help users find information",
    description: "Point people to the right page, product or contact.",
    icon: Search,
  },
  {
    id: "automate",
    title: "Automate repetitive tasks",
    description: "Take the first response so your team is not repeating itself.",
    icon: Repeat,
  },
  {
    id: "website-assistant",
    title: "Act as an AI assistant on my website/app",
    description: "Be present wherever your customers already are.",
    icon: BookOpen,
  },
] as const;

export const ASSISTANT_ROLES = [
  { value: "customer-support", label: "Customer Support Assistant" },
  { value: "sales", label: "Sales Assistant" },
  { value: "information", label: "Information Assistant" },
  { value: "receptionist", label: "Virtual Receptionist" },
  { value: "custom", label: "Custom Assistant" },
] as const;

export const ASSISTANT_TONES = [
  { value: "professional", label: "Professional" },
  { value: "friendly", label: "Friendly" },
  { value: "formal", label: "Formal" },
  { value: "conversational", label: "Conversational" },
] as const;

export function roleLabel(value: string): string {
  return ASSISTANT_ROLES.find((role) => role.value === value)?.label ?? "AI Assistant";
}

export function goalTitle(id: string): string {
  return GOAL_CARDS.find((goal) => goal.id === id)?.title ?? id;
}
