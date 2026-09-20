import {
  listFaqs,
  listGeneral,
  listImages,
  listProducts,
  listProperties,
  listServices,
  saveFaq,
  saveGeneral,
  saveImage,
  saveProduct,
  saveProperty,
  saveService,
} from "./api";
import type { KbEntity } from "./types";

/** Import / export helpers for the Knowledge Base (client-side, no server needed). */

export interface KbExportFile {
  format: "conversaai.kb";
  version: 1;
  exported_at: string;
  general: unknown[];
  faqs: unknown[];
  products: unknown[];
  services: unknown[];
  images: unknown[];
  properties: unknown[];
}

export async function buildKbExport(): Promise<KbExportFile> {
  const [general, faqs, products, services, images, properties] = await Promise.all([
    listGeneral(),
    listFaqs(),
    listProducts(),
    listServices(),
    listImages(),
    listProperties(),
  ]);
  return {
    format: "conversaai.kb",
    version: 1,
    exported_at: new Date().toISOString(),
    general,
    faqs,
    products,
    services,
    images,
    properties,
  };
}

function toCsvValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  const raw = Array.isArray(value) ? value.join(" | ") : String(value);
  return /[",\n]/.test(raw) ? `"${raw.replace(/"/g, '""')}"` : raw;
}

export function rowsToCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0] as Record<string, unknown>);
  return [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => toCsvValue(row[header])).join(",")),
  ].join("\n");
}

export function downloadFile(filename: string, contents: string, mime: string) {
  const url = URL.createObjectURL(new Blob([contents], { type: mime }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

const STAMP = () => new Date().toISOString().slice(0, 10);

export async function exportKbJson(): Promise<number> {
  const payload = await buildKbExport();
  downloadFile(
    `conversaai-knowledge-base-${STAMP()}.json`,
    JSON.stringify(payload, null, 2),
    "application/json",
  );
  return (
    payload.general.length +
    payload.faqs.length +
    payload.products.length +
    payload.services.length +
    payload.images.length +
    payload.properties.length
  );
}

export async function exportKbCsv(entity: KbEntity): Promise<number> {
  const payload = await buildKbExport();
  const rows = payload[entity] as Record<string, unknown>[];
  if (rows.length === 0) throw new Error("There is nothing to export in this section yet.");
  downloadFile(`conversaai-${entity}-${STAMP()}.csv`, rowsToCsv(rows), "text/csv");
  return rows.length;
}

export interface ImportIssue {
  section: KbEntity;
  row: number;
  label: string;
  reason: string;
}

export interface ImportResult {
  general: number;
  faqs: number;
  products: number;
  services: number;
  images: number;
  properties: number;
  skipped: number;
  failed: number;
  imported: number;
  issues: ImportIssue[];
  durationMs: number;
  fileName?: string;
}

function asArray(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? (value as Record<string, unknown>[]) : [];
}

const text = (value: unknown): string => (typeof value === "string" ? value : "");
const num = (value: unknown): number | null => {
  const parsed = typeof value === "number" ? value : Number.parseFloat(text(value));
  return Number.isFinite(parsed) ? parsed : null;
};
const list = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.map(String)
    : text(value)
      ? text(value)
          .split(/[|,]/)
          .map((item) => item.trim())
          .filter(Boolean)
      : [];

/** Parses a ConversaAI export file and re-creates every valid entry, reporting per-row outcomes. */
export async function importKbJson(raw: string, fileName?: string): Promise<ImportResult> {
  const started = Date.now();
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("That file isn't valid JSON.");
  }
  const source = parsed as Record<string, unknown>;
  if (!source || typeof source !== "object") throw new Error("Unexpected file contents.");

  const sections: KbEntity[] = ["general", "faqs", "products", "services", "images", "properties"];
  if (!sections.some((section) => Array.isArray(source[section]))) {
    throw new Error(
      "No knowledge base sections found. Export a backup from ConversaAI and import that file.",
    );
  }

  const result: ImportResult = {
    general: 0,
    faqs: 0,
    products: 0,
    services: 0,
    images: 0,
    properties: 0,
    skipped: 0,
    failed: 0,
    imported: 0,
    issues: [],
    durationMs: 0,
    ...(fileName ? { fileName } : {}),
  };

  const skip = (section: KbEntity, row: number, label: string, reason: string) => {
    result.skipped += 1;
    result.issues.push({ section, row, label, reason });
  };
  const fail = (section: KbEntity, row: number, label: string, error: unknown) => {
    result.failed += 1;
    result.issues.push({ section, row, label, reason: (error as Error).message });
  };

  const faqs = asArray(source["faqs"]);
  const generalRows = asArray(source["general"]);
  for (let index = 0; index < generalRows.length; index += 1) {
    const row = generalRows[index] as Record<string, unknown>;
    const label = text(row["title"]).slice(0, 60) || `Row ${index + 1}`;
    if (!text(row["title"]).trim() || !text(row["content"]).trim()) {
      skip("general", index + 1, label, "A title and content are both required.");
      continue;
    }
    try {
      await saveGeneral({
        title: text(row["title"]),
        content: text(row["content"]),
        status: text(row["status"]) || "ready",
      });
      result.general += 1;
    } catch (error) {
      fail("general", index + 1, label, error);
    }
  }

  for (let index = 0; index < faqs.length; index += 1) {
    const row = faqs[index] as Record<string, unknown>;
    const label = text(row["question"]).slice(0, 60) || `Row ${index + 1}`;
    if (!text(row["question"]).trim() || !text(row["answer"]).trim()) {
      skip("faqs", index + 1, label, "A question and an answer are both required.");
      continue;
    }
    try {
      await saveFaq({
        question: text(row["question"]),
        answer: text(row["answer"]),
        category: text(row["category"]) || null,
        status: text(row["status"]) || "published",
      });
      result.faqs += 1;
    } catch (error) {
      fail("faqs", index + 1, label, error);
    }
  }

  const products = asArray(source["products"]);
  for (let index = 0; index < products.length; index += 1) {
    const row = products[index] as Record<string, unknown>;
    const label = text(row["name"]).slice(0, 60) || `Row ${index + 1}`;
    if (!text(row["name"]).trim()) {
      skip("products", index + 1, label, "A product name is required.");
      continue;
    }
    try {
      await saveProduct({
        name: text(row["name"]),
        description: text(row["description"]) || null,
        price: num(row["price"]),
        currency: text(row["currency"]) || "USD",
        availability: text(row["availability"]) || "in_stock",
        category: text(row["category"]) || null,
        image_urls: list(row["image_urls"]),
      });
      result.products += 1;
    } catch (error) {
      fail("products", index + 1, label, error);
    }
  }

  const services = asArray(source["services"]);
  for (let index = 0; index < services.length; index += 1) {
    const row = services[index] as Record<string, unknown>;
    const label = text(row["name"]).slice(0, 60) || `Row ${index + 1}`;
    if (!text(row["name"]).trim()) {
      skip("services", index + 1, label, "A service name is required.");
      continue;
    }
    try {
      await saveService({
        name: text(row["name"]),
        description: text(row["description"]) || null,
        duration: text(row["duration"]) || null,
        price: num(row["price"]),
        currency: text(row["currency"]) || "USD",
        availability: text(row["availability"]) || "available",
        category: text(row["category"]) || null,
        image_urls: list(row["image_urls"]),
      });
      result.services += 1;
    } catch (error) {
      fail("services", index + 1, label, error);
    }
  }

  const properties = asArray(source["properties"]);
  const imageRows = asArray(source["images"]);
  for (let index = 0; index < imageRows.length; index += 1) {
    const row = imageRows[index] as Record<string, unknown>;
    const label = text(row["title"]).slice(0, 60) || `Row ${index + 1}`;
    if (!text(row["image_url"]).trim()) {
      skip("images", index + 1, label, "An image URL is required.");
      continue;
    }
    try {
      await saveImage({
        title: text(row["title"]),
        caption: text(row["caption"]) || null,
        image_url: text(row["image_url"]),
        storage_path: text(row["storage_path"]) || text(row["image_url"]),
        status: text(row["status"]) || "ready",
      });
      result.images += 1;
    } catch (error) {
      fail("images", index + 1, label, error);
    }
  }

  for (let index = 0; index < properties.length; index += 1) {
    const row = properties[index] as Record<string, unknown>;
    const label = text(row["title"]).slice(0, 60) || `Row ${index + 1}`;
    if (!text(row["title"]).trim()) {
      skip("properties", index + 1, label, "A property title is required.");
      continue;
    }
    try {
      await saveProperty({
        title: text(row["title"]),
        property_type: text(row["property_type"]) || null,
        location: text(row["location"]) || null,
        price: num(row["price"]),
        currency: text(row["currency"]) || "USD",
        bedrooms: num(row["bedrooms"]),
        bathrooms: num(row["bathrooms"]),
        area: text(row["area"]) || null,
        description: text(row["description"]) || null,
        features: list(row["features"]),
        image_urls: list(row["image_urls"]),
        status: text(row["status"]) || "available",
      });
      result.properties += 1;
    } catch (error) {
      fail("properties", index + 1, label, error);
    }
  }

  result.imported =
    result.general +
    result.faqs +
    result.products +
    result.services +
    result.images +
    result.properties;
  result.durationMs = Date.now() - started;
  return result;
}
