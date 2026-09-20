import { retrieveChunks } from "@/lib/knowledge/search";
import type { KnowledgeChunk } from "@/lib/knowledge/types";

export interface AiReply {
  answer: string;
  sources: KnowledgeChunk[];
  mode: "mock";
  confidence: "high" | "medium" | "none";
}

export type AssistantPersona = {
  name?: string;
  tone?: string;
  instructions?: string;
};

const ENTITY_LABEL: Record<KnowledgeChunk["entity"], string> = {
  general: "general information",
  faqs: "FAQ",
  products: "product",
  services: "service",
  images: "image",
  properties: "property",
};

function trim(text: string, max = 260): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max).trimEnd()}…` : clean;
}

/**
 * Mock reply engine. It performs real Knowledge Base retrieval and wraps the
 * result in a canned response so a later sprint only has to replace the
 * generation step with a model call — the retrieval contract stays identical.
 */
export function generateMockReply(
  message: string,
  chunks: KnowledgeChunk[],
  persona?: AssistantPersona,
): AiReply {
  const name = persona?.name?.trim() || "your assistant";
  const handoff =
    persona?.instructions?.trim() ||
    "If I don't have the answer, I'll offer to connect the customer with your team.";

  if (chunks.length === 0) {
    return {
      mode: "mock",
      confidence: "none",
      sources: [],
      answer: `I'm ${name}. Your Knowledge Base is still empty, so I don't have organisation-specific answers yet. Add FAQs, products or services and ask me again. ${handoff}`,
    };
  }

  const sources = retrieveChunks(chunks, message);

  if (sources.length === 0) {
    return {
      mode: "mock",
      confidence: "none",
      sources: [],
      answer:
        "I couldn't find anything in your Knowledge Base that matches that question. Try different wording, or add an entry covering it — once live AI is connected I'll also reason beyond exact keyword matches.",
    };
  }

  const first = sources[0]!;
  const label = ENTITY_LABEL[first.entity];
  const extra = sources.slice(1);

  const opening =
    first.entity === "faqs"
      ? `Here's what your Knowledge Base says about "${first.title}":`
      : first.entity === "properties"
        ? `I found the ${label} "${first.title}"${first.meta ? ` — ${first.meta}` : ""}.`
        : `I found the ${label} "${first.title}"${first.meta ? ` (${first.meta})` : ""}.`;

  const body = first.body ? ` ${trim(first.body)}` : "";
  const more = extra.length
    ? ` I also matched ${extra.length} other entr${extra.length === 1 ? "y" : "ies"}: ${extra
        .map((source) => `"${source.title}"`)
        .join(", ")}.`
    : "";

  return {
    mode: "mock",
    sources,
    confidence: extra.length > 0 ? "high" : "medium",
    answer: `${opening}${body}${more}`,
  };
}
