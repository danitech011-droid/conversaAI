export type AssistantResponseContext = {
  ownerId: string;
  installationId: string;
  conversationId: string;
  recentMessages: Array<{ role: string; content: string }>;
  assistantConfiguration: Record<string, unknown>;
  knowledgeContext: unknown[];
};

export type AssistantResponse =
  | { connected: false; code: "AI_NOT_CONNECTED"; message: string }
  | { connected: true; content: string; metadata?: Record<string, unknown> };

/**
 * Phase 3 replaces this boundary with provider + knowledge retrieval calls.
 * Keeping it server-only prevents provider credentials from entering the widget.
 */
export async function generateAssistantResponse(
  _context: AssistantResponseContext,
): Promise<AssistantResponse> {
  return {
    connected: false,
    code: "AI_NOT_CONNECTED",
    message: "The AI response service is not connected yet.",
  };
}