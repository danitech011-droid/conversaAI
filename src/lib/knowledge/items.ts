import type {
  CompanyInfo,
  Faq,
  GeneralInfo,
  KnowledgeImage,
  KnowledgeListItem,
  Product,
  Property,
  Service,
} from "./types";
import { statusLabel as getStatusLabel } from "./types";

function preview(text: string, max = 140): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max).trim()}…`;
}

export function toKnowledgeListItems(input: {
  general: GeneralInfo[];
  faqs: Faq[];
  products: Product[];
  services: Service[];
  images: KnowledgeImage[];
  properties: Property[];
}): KnowledgeListItem[] {
  const items: KnowledgeListItem[] = [
    ...input.general.map<KnowledgeListItem>((item) => ({
      id: item.id,
      entity: "general",
      type: "general",
      title: item.title,
      preview: preview(item.content),
      status: item.status,
      statusLabel: getStatusLabel(item.status),
      updated_at: item.updated_at,
    })),
    ...input.faqs.map<KnowledgeListItem>((item) => ({
      id: item.id,
      entity: "faqs",
      type: "faq",
      title: item.question,
      preview: preview(item.answer),
      status: item.status,
      statusLabel: getStatusLabel(item.status),
      updated_at: item.updated_at,
      meta: item.category ?? undefined,
    })),
    ...input.products.map<KnowledgeListItem>((item) => ({
      id: item.id,
      entity: "products",
      type: "product",
      title: item.name,
      preview: preview(item.description ?? ""),
      status: item.availability,
      statusLabel: getStatusLabel(item.availability),
      updated_at: item.updated_at,
      meta: [item.category, item.price != null ? `${item.currency} ${item.price}` : null]
        .filter(Boolean)
        .join(" · ") || undefined,
      imageUrl: item.image_urls[0],
    })),
    ...input.services.map<KnowledgeListItem>((item) => ({
      id: item.id,
      entity: "services",
      type: "service",
      title: item.name,
      preview: preview(item.description ?? ""),
      status: item.availability,
      statusLabel: getStatusLabel(item.availability),
      updated_at: item.updated_at,
      meta: [item.category, item.duration, item.price != null ? `${item.currency} ${item.price}` : null]
        .filter(Boolean)
        .join(" · ") || undefined,
      imageUrl: item.image_urls[0],
    })),
    ...input.images.map<KnowledgeListItem>((item) => ({
      id: item.id,
      entity: "images",
      type: "image",
      title: item.title || "Untitled image",
      preview: preview(item.caption ?? ""),
      status: item.status,
      statusLabel: getStatusLabel(item.status),
      updated_at: item.updated_at,
      imageUrl: item.image_url,
    })),
    ...input.properties.map<KnowledgeListItem>((item) => ({
      id: item.id,
      entity: "properties",
      type: "property",
      title: item.title,
      preview: preview(item.description ?? ""),
      status: item.status,
      statusLabel: getStatusLabel(item.status),
      updated_at: item.updated_at,
      meta: [item.property_type, item.location].filter(Boolean).join(" · ") || undefined,
      imageUrl: item.image_urls[0],
    })),
  ];

  return items.sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
  );
}

export function filterKnowledgeItems(
  items: KnowledgeListItem[],
  filter: string,
): KnowledgeListItem[] {
  if (filter === "all") return items;
  if (filter === "general") return items.filter((item) => item.type === "general");
  if (filter === "faqs") return items.filter((item) => item.type === "faq");
  if (filter === "products") return items.filter((item) => item.type === "product");
  if (filter === "services") return items.filter((item) => item.type === "service");
  if (filter === "images") return items.filter((item) => item.type === "image");
  if (filter === "properties") return items.filter((item) => item.type === "property");
  return items;
}

export function searchKnowledgeItems(items: KnowledgeListItem[], query: string): KnowledgeListItem[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return items;
  return items.filter((item) =>
    [item.title, item.preview, item.meta ?? ""].some((value) =>
      value.toLowerCase().includes(needle),
    ),
  );
}

export function companyHasKnowledge(company: CompanyInfo | null): boolean {
  if (!company) return false;
  return Boolean(
    company.description?.trim() ||
      company.mission?.trim() ||
      company.business_hours?.trim() ||
      company.address?.trim() ||
      company.phone?.trim() ||
      company.business_email?.trim(),
  );
}
