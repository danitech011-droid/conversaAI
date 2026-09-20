/**
 * Knowledge Base domain types.
 *
 * These shapes are the contract the future AI Knowledge Engine will read from.
 * Keep them serialisable and free of UI concerns.
 */

export type KbStatus = "published" | "draft";

export interface KbBase {
  id: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface Faq extends KbBase {
  question: string;
  answer: string;
  category: string | null;
  status: string;
}

export interface Product extends KbBase {
  name: string;
  description: string | null;
  price: number | null;
  currency: string;
  availability: string;
  category: string | null;
  image_urls: string[];
}

export interface Service extends KbBase {
  name: string;
  description: string | null;
  duration: string | null;
  price: number | null;
  currency: string;
  availability: string;
  category: string | null;
  image_urls: string[];
}

export interface GeneralInfo extends KbBase {
  title: string;
  content: string;
  status: string;
}

export interface KnowledgeImage extends KbBase {
  title: string;
  caption: string | null;
  storage_path: string;
  image_url: string;
  status: string;
}

export interface Property extends KbBase {
  title: string;
  property_type: string | null;
  location: string | null;
  price: number | null;
  currency: string;
  bedrooms: number | null;
  bathrooms: number | null;
  area: string | null;
  description: string | null;
  features: string[];
  image_urls: string[];
  status: string;
}

export interface CompanyInfo {
  id: string;
  company_name: string;
  description: string | null;
  mission: string | null;
  business_hours: string | null;
  phone: string | null;
  business_email: string | null;
  website: string | null;
  address: string | null;
  social_facebook: string | null;
  social_instagram: string | null;
  social_twitter: string | null;
  social_linkedin: string | null;
  social_tiktok: string | null;
}

export type KbEntity = "faqs" | "products" | "services" | "properties" | "general" | "images";

export type KnowledgeFilter =
  | "all"
  | "general"
  | "faqs"
  | "products"
  | "services"
  | "images"
  | "properties"
  | "company";

export type KnowledgeListType =
  | "general"
  | "faq"
  | "product"
  | "service"
  | "image"
  | "property";

/** Unified list row for the Knowledge Base hub. */
export interface KnowledgeListItem {
  id: string;
  entity: KbEntity;
  type: KnowledgeListType;
  title: string;
  preview: string;
  status: string;
  statusLabel: string;
  updated_at: string;
  meta?: string | undefined;
  imageUrl?: string | undefined;
}

export const KB_STATUS_LABELS: Record<string, string> = {
  published: "Ready for AI",
  ready: "Ready for AI",
  draft: "Draft",
  in_stock: "Available",
  available: "Available",
  low_stock: "Low stock",
  out_of_stock: "Out of stock",
  preorder: "Pre-order",
  limited: "Limited",
  unavailable: "Unavailable",
  reserved: "Reserved",
  sold: "Sold",
  rented: "Rented",
};

/** A normalised record any retrieval layer (search today, AI tomorrow) can rank. */
export interface KnowledgeChunk {
  id: string;
  entity: KbEntity;
  title: string;
  body: string;
  meta?: string | undefined;
  updated_at: string;
}

export const PRODUCT_AVAILABILITY = [
  { value: "in_stock", label: "In stock" },
  { value: "low_stock", label: "Low stock" },
  { value: "out_of_stock", label: "Out of stock" },
  { value: "preorder", label: "Pre-order" },
] as const;

export const SERVICE_AVAILABILITY = [
  { value: "available", label: "Available" },
  { value: "limited", label: "Limited availability" },
  { value: "unavailable", label: "Unavailable" },
] as const;

export const PROPERTY_STATUS = [
  { value: "available", label: "Available" },
  { value: "reserved", label: "Reserved" },
  { value: "sold", label: "Sold" },
  { value: "rented", label: "Rented" },
] as const;

export const PROPERTY_TYPES = [
  "Villa",
  "Apartment",
  "Townhouse",
  "Penthouse",
  "Studio",
  "Land",
  "Office",
  "Retail",
] as const;

export const CURRENCIES = ["USD", "EUR", "GBP", "AED", "SAR", "NGN", "PKR", "INR"] as const;

export function statusLabel(status: string): string {
  return KB_STATUS_LABELS[status] ?? "Saved";
}

export function labelFor(
  options: readonly { value: string; label: string }[],
  value: string,
): string {
  return options.find((option) => option.value === value)?.label ?? value;
}
