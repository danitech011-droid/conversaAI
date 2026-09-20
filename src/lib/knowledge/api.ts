import { supabase } from "@/integrations/supabase/client";
import { logAudit } from "@/lib/workspace/api";
import type {
  CompanyInfo,
  Faq,
  GeneralInfo,
  KnowledgeChunk,
  KnowledgeImage,
  Product,
  Property,
  Service,
} from "./types";

/**
 * Thin data-access layer for the Knowledge Base.
 * Every call is scoped to the signed-in owner through RLS + explicit owner_id.
 */

async function requireUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("You need to be signed in.");
  return data.user.id;
}

function unwrap<T>({ data, error }: { data: T | null; error: { message: string } | null }): T {
  if (error) throw new Error(error.message);
  return (data ?? []) as T;
}

/* ----------------------------- General info ----------------------------- */

export async function listGeneral(): Promise<GeneralInfo[]> {
  return unwrap<GeneralInfo[]>(
    (await supabase.from("kb_general").select("*").order("updated_at", { ascending: false })) as never,
  );
}

export async function saveGeneral(input: Partial<GeneralInfo> & { id?: string }): Promise<void> {
  const owner_id = await requireUserId();
  const payload = {
    owner_id,
    title: input.title ?? "",
    content: input.content ?? "",
    status: input.status ?? "ready",
  };
  const query = input.id
    ? supabase.from("kb_general").update(payload).eq("id", input.id)
    : supabase.from("kb_general").insert(payload);
  const { error } = await query;
  if (error) throw new Error(error.message);
  await logAudit({
    action: input.id ? "kb.updated" : "kb.created",
    area: "knowledge-base",
    summary: `${input.id ? "Updated" : "Added"} general info “${payload.title}”`,
    metadata: { entity: "general" },
  });
}

/* ------------------------------ Images ---------------------------------- */

export async function listImages(): Promise<KnowledgeImage[]> {
  return unwrap<KnowledgeImage[]>(
    (await supabase.from("kb_images").select("*").order("updated_at", { ascending: false })) as never,
  );
}

export async function saveImage(input: Partial<KnowledgeImage> & { id?: string }): Promise<void> {
  const owner_id = await requireUserId();
  const payload = {
    owner_id,
    title: input.title ?? "",
    caption: input.caption ?? null,
    storage_path: input.storage_path ?? "",
    image_url: input.image_url ?? "",
    status: input.status ?? "ready",
  };
  const query = input.id
    ? supabase.from("kb_images").update(payload).eq("id", input.id)
    : supabase.from("kb_images").insert(payload);
  const { error } = await query;
  if (error) throw new Error(error.message);
  await logAudit({
    action: input.id ? "kb.updated" : "kb.created",
    area: "knowledge-base",
    summary: `${input.id ? "Updated" : "Added"} image “${payload.title || "Untitled"}”`,
    metadata: { entity: "image" },
  });
}

/* ------------------------------- FAQs ---------------------------------- */

export async function listFaqs(): Promise<Faq[]> {
  return unwrap<Faq[]>(
    (await supabase.from("kb_faqs").select("*").order("updated_at", { ascending: false })) as never,
  );
}

export async function saveFaq(input: Partial<Faq> & { id?: string }): Promise<void> {
  const owner_id = await requireUserId();
  const payload = {
    owner_id,
    question: input.question ?? "",
    answer: input.answer ?? "",
    category: input.category ?? null,
    status: input.status ?? "published",
  };
  const query = input.id
    ? supabase.from("kb_faqs").update(payload).eq("id", input.id)
    : supabase.from("kb_faqs").insert(payload);
  const { error } = await query;
  if (error) throw new Error(error.message);
  await logAudit({
    action: input.id ? "kb.updated" : "kb.created",
    area: "knowledge-base",
    summary: `${input.id ? "Updated" : "Added"} FAQ “${payload.question}”`,
    metadata: { entity: "FAQ" },
  });
}

/* ------------------------------ Products -------------------------------- */

export async function listProducts(): Promise<Product[]> {
  return unwrap<Product[]>(
    (await supabase
      .from("kb_products")
      .select("*")
      .order("updated_at", { ascending: false })) as never,
  );
}

export async function saveProduct(input: Partial<Product> & { id?: string }): Promise<void> {
  const owner_id = await requireUserId();
  const payload = {
    owner_id,
    name: input.name ?? "",
    description: input.description ?? null,
    price: input.price ?? null,
    currency: input.currency ?? "USD",
    availability: input.availability ?? "in_stock",
    category: input.category ?? null,
    image_urls: input.image_urls ?? [],
  };
  const query = input.id
    ? supabase.from("kb_products").update(payload).eq("id", input.id)
    : supabase.from("kb_products").insert(payload);
  const { error } = await query;
  if (error) throw new Error(error.message);
  await logAudit({
    action: input.id ? "kb.updated" : "kb.created",
    area: "knowledge-base",
    summary: `${input.id ? "Updated" : "Added"} product “${payload.name}”`,
    metadata: { entity: "product" },
  });
}

/* ------------------------------ Services -------------------------------- */

export async function listServices(): Promise<Service[]> {
  return unwrap<Service[]>(
    (await supabase
      .from("kb_services")
      .select("*")
      .order("updated_at", { ascending: false })) as never,
  );
}

export async function saveService(input: Partial<Service> & { id?: string }): Promise<void> {
  const owner_id = await requireUserId();
  const payload = {
    owner_id,
    name: input.name ?? "",
    description: input.description ?? null,
    duration: input.duration ?? null,
    price: input.price ?? null,
    currency: input.currency ?? "USD",
    availability: input.availability ?? "available",
    category: input.category ?? null,
    image_urls: input.image_urls ?? [],
  };
  const query = input.id
    ? supabase.from("kb_services").update(payload).eq("id", input.id)
    : supabase.from("kb_services").insert(payload);
  const { error } = await query;
  if (error) throw new Error(error.message);
  await logAudit({
    action: input.id ? "kb.updated" : "kb.created",
    area: "knowledge-base",
    summary: `${input.id ? "Updated" : "Added"} service “${payload.name}”`,
    metadata: { entity: "service" },
  });
}

/* ----------------------------- Properties ------------------------------- */

export async function listProperties(): Promise<Property[]> {
  return unwrap<Property[]>(
    (await supabase
      .from("kb_properties")
      .select("*")
      .order("updated_at", { ascending: false })) as never,
  );
}

export async function saveProperty(input: Partial<Property> & { id?: string }): Promise<void> {
  const owner_id = await requireUserId();
  const payload = {
    owner_id,
    title: input.title ?? "",
    property_type: input.property_type ?? null,
    location: input.location ?? null,
    price: input.price ?? null,
    currency: input.currency ?? "USD",
    bedrooms: input.bedrooms ?? null,
    bathrooms: input.bathrooms ?? null,
    area: input.area ?? null,
    description: input.description ?? null,
    features: input.features ?? [],
    image_urls: input.image_urls ?? [],
    status: input.status ?? "available",
  };
  const query = input.id
    ? supabase.from("kb_properties").update(payload).eq("id", input.id)
    : supabase.from("kb_properties").insert(payload);
  const { error } = await query;
  if (error) throw new Error(error.message);
  await logAudit({
    action: input.id ? "kb.updated" : "kb.created",
    area: "knowledge-base",
    summary: `${input.id ? "Updated" : "Added"} property “${payload.title}”`,
    metadata: { entity: "property" },
  });
}

/* ------------------------------- Shared --------------------------------- */

const TABLES = {
  faqs: "kb_faqs",
  products: "kb_products",
  services: "kb_services",
  properties: "kb_properties",
  general: "kb_general",
  images: "kb_images",
} as const;

export async function deleteKbItem(entity: keyof typeof TABLES, id: string): Promise<void> {
  if (entity === "images") {
    const { data } = await supabase
      .from("kb_images")
      .select("storage_path")
      .eq("id", id)
      .maybeSingle();
    if (data?.storage_path) {
      await supabase.storage.from("business-logos").remove([data.storage_path]);
    }
  }

  const { error } = await supabase.from(TABLES[entity]).delete().eq("id", id);
  if (error) throw new Error(error.message);
  await logAudit({
    action: "kb.deleted",
    area: "knowledge-base",
    summary: `Deleted an entry from ${entity}`,
    metadata: { entity, id },
  });
}

/* --------------------------- Company profile ---------------------------- */

export async function getCompanyInfo(): Promise<CompanyInfo | null> {
  const owner_id = await requireUserId();
  const { data, error } = await supabase
    .from("businesses")
    .select(
      "id, company_name, description, mission, business_hours, phone, business_email, website, address, social_facebook, social_instagram, social_twitter, social_linkedin, social_tiktok",
    )
    .eq("owner_id", owner_id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as CompanyInfo | null) ?? null;
}

export async function saveCompanyInfo(input: Partial<CompanyInfo>): Promise<void> {
  const owner_id = await requireUserId();
  const { id, ...rest } = input;
  const { error } = id
    ? await supabase.from("businesses").update(rest).eq("id", id)
    : await supabase
        .from("businesses")
        .insert({ ...rest, owner_id, company_name: rest.company_name ?? "My business" });
  if (error) throw new Error(error.message);
}

/* ------------------------------ Retrieval -------------------------------- */

/**
 * Loads the whole Knowledge Base as normalised chunks.
 * The future AI engine consumes exactly this shape — no AI logic lives here.
 */
export async function loadKnowledgeChunks(): Promise<KnowledgeChunk[]> {
  const [general, faqs, products, services, images, properties, company] = await Promise.all([
    listGeneral(),
    listFaqs(),
    listProducts(),
    listServices(),
    listImages(),
    listProperties(),
    getCompanyInfo(),
  ]);

  const companyChunks: KnowledgeChunk[] = company
    ? [
        ...(company.description
          ? [
              {
                id: `${company.id}-description`,
                entity: "general" as const,
                title: `${company.company_name} — About`,
                body: company.description,
                updated_at: new Date().toISOString(),
              },
            ]
          : []),
        ...(company.mission
          ? [
              {
                id: `${company.id}-mission`,
                entity: "general" as const,
                title: `${company.company_name} — Mission`,
                body: company.mission,
                updated_at: new Date().toISOString(),
              },
            ]
          : []),
        ...(company.business_hours
          ? [
              {
                id: `${company.id}-hours`,
                entity: "general" as const,
                title: "Business hours",
                body: company.business_hours,
                updated_at: new Date().toISOString(),
              },
            ]
          : []),
      ]
    : [];

  return [
    ...companyChunks,
    ...general.map<KnowledgeChunk>((item) => ({
      id: item.id,
      entity: "general",
      title: item.title,
      body: item.content,
      updated_at: item.updated_at,
    })),
    ...faqs.map<KnowledgeChunk>((faq) => ({
      id: faq.id,
      entity: "faqs",
      title: faq.question,
      body: faq.answer,
      meta: faq.category ?? undefined,
      updated_at: faq.updated_at,
    })),
    ...products.map<KnowledgeChunk>((product) => ({
      id: product.id,
      entity: "products",
      title: product.name,
      body: product.description ?? "",
      meta: [product.category, product.availability].filter(Boolean).join(" · "),
      updated_at: product.updated_at,
    })),
    ...services.map<KnowledgeChunk>((service) => ({
      id: service.id,
      entity: "services",
      title: service.name,
      body: service.description ?? "",
      meta: [service.category, service.duration, service.availability].filter(Boolean).join(" · "),
      updated_at: service.updated_at,
    })),
    ...images.map<KnowledgeChunk>((image) => ({
      id: image.id,
      entity: "images",
      title: image.title || "Image",
      body: image.caption ?? "",
      updated_at: image.updated_at,
    })),
    ...properties.map<KnowledgeChunk>((property) => ({
      id: property.id,
      entity: "properties",
      title: property.title,
      body: [property.description, property.features.join(", ")].filter(Boolean).join(" "),
      meta: [property.property_type, property.location, property.status]
        .filter(Boolean)
        .join(" · "),
      updated_at: property.updated_at,
    })),
  ];
}

export async function getKnowledgeCounts() {
  const [general, faqs, products, services, images, properties, company] = await Promise.all([
    supabase.from("kb_general").select("id", { count: "exact", head: true }),
    supabase.from("kb_faqs").select("id", { count: "exact", head: true }),
    supabase.from("kb_products").select("id", { count: "exact", head: true }),
    supabase.from("kb_services").select("id", { count: "exact", head: true }),
    supabase.from("kb_images").select("id", { count: "exact", head: true }),
    supabase.from("kb_properties").select("id", { count: "exact", head: true }),
    getCompanyInfo(),
  ]);

  const generalCount = general.count ?? 0;
  const faqCount = faqs.count ?? 0;
  const productCount = products.count ?? 0;
  const serviceCount = services.count ?? 0;
  const imageCount = images.count ?? 0;
  const propertyCount = properties.count ?? 0;
  const companyCount =
    company &&
    (company.description?.trim() ||
      company.mission?.trim() ||
      company.business_hours?.trim() ||
      company.address?.trim())
      ? 1
      : 0;

  const other = generalCount + imageCount + propertyCount + companyCount;

  return {
    general: generalCount + companyCount,
    faqs: faqCount,
    products: productCount,
    services: serviceCount,
    images: imageCount,
    properties: propertyCount,
    other,
    total: generalCount + faqCount + productCount + serviceCount + imageCount + propertyCount + companyCount,
  };
}

/** Loads every knowledge collection for the unified hub view. */
export async function loadAllKnowledge() {
  const [general, faqs, products, services, images, properties, company] = await Promise.all([
    listGeneral(),
    listFaqs(),
    listProducts(),
    listServices(),
    listImages(),
    listProperties(),
    getCompanyInfo(),
  ]);
  return { general, faqs, products, services, images, properties, company };
}

/* -------------------------- Knowledge images ----------------------------- */

/** Uploads an image to the private bucket and returns path + signed URL. */
export async function uploadKnowledgeImage(
  file: File,
  folder: string,
): Promise<{ path: string; url: string }> {
  const owner_id = await requireUserId();
  const extension = file.name.split(".").pop() ?? "png";
  const path = `${owner_id}/${folder}/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage
    .from("business-logos")
    .upload(path, file, { upsert: true, contentType: file.type });
  if (error) throw new Error(error.message);

  const { data } = await supabase.storage
    .from("business-logos")
    .createSignedUrl(path, 60 * 60 * 24 * 365);
  return { path, url: data?.signedUrl ?? path };
}
