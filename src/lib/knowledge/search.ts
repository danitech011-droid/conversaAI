import type { KnowledgeChunk } from "./types";

/**
 * Lightweight keyword retrieval over Knowledge Base chunks.
 * Sprint 3 can swap this for embeddings without touching the UI.
 */
export function scoreChunk(chunk: KnowledgeChunk, query: string): number {
  const terms = query.toLowerCase().split(/\s+/).filter((term) => term.length > 2);
  if (terms.length === 0) return 0;

  const title = chunk.title.toLowerCase();
  const body = chunk.body.toLowerCase();
  const meta = (chunk.meta ?? "").toLowerCase();

  return terms.reduce((score, term) => {
    if (title.includes(term)) return score + 3;
    if (meta.includes(term)) return score + 2;
    if (body.includes(term)) return score + 1;
    return score;
  }, 0);
}

export function retrieveChunks(
  chunks: KnowledgeChunk[],
  query: string,
  limit = 4,
): KnowledgeChunk[] {
  return chunks
    .map((chunk) => ({ chunk, score: scoreChunk(chunk, query) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.chunk);
}

/** Generic client-side filter used by every Knowledge Base tab. */
export function filterByQuery<T>(items: T[], query: string, fields: (item: T) => string[]): T[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return items;
  return items.filter((item) =>
    fields(item)
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(needle)),
  );
}
