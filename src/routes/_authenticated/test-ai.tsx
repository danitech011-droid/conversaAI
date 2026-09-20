import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bot, Eraser, SendHorizonal, Sparkles, User } from "lucide-react";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { generateMockReply } from "@/lib/ai/mock-engine";
import { loadKnowledgeChunks } from "@/lib/knowledge/api";
import type { KnowledgeChunk } from "@/lib/knowledge/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/test-ai")({
  head: () => ({
    meta: [
      { title: "Test AI — ConversaAI" },
      {
        name: "description",
        content:
          "Preview how your assistant will answer customers using your Knowledge Base, in mock mode.",
      },
      { property: "og:title", content: "Test AI — ConversaAI" },
      { property: "og:description", content: "Mock chat preview powered by your Knowledge Base." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TestAiPage,
});

type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
  sources?: KnowledgeChunk[];
  confidence?: "high" | "medium" | "none";
};

const WELCOME: Message = {
  id: "welcome",
  role: "assistant",
  text: "Hi! I'm your ConversaAI assistant running in mock mode. Ask me anything about your business and I'll answer from your Knowledge Base.",
};

const SUGGESTIONS = [
  "What are your business hours?",
  "Do you have anything available right now?",
  "How much does it cost?",
  "Where are you located?",
];

const CONFIDENCE_STYLE = {
  high: "bg-primary/10 text-primary",
  medium: "bg-cyan/10 text-cyan",
  none: "bg-muted text-muted-foreground",
} as const;

function TestAiPage() {
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const { data: chunks = [], isLoading } = useQuery({
    queryKey: ["kb", "chunks"],
    queryFn: loadKnowledgeChunks,
  });

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  function send(text: string) {
    const question = text.trim();
    if (!question || thinking) return;

    setMessages((prev) => [...prev, { id: `${Date.now()}-u`, role: "user", text: question }]);
    setInput("");
    setThinking(true);

    window.setTimeout(() => {
      const reply = generateMockReply(question, chunks);
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-a`,
          role: "assistant",
          text: reply.answer,
          sources: reply.sources,
          confidence: reply.confidence,
        },
      ]);
      setThinking(false);
    }, 650);
  }

  return (
    <DashboardLayout
      title="Test AI"
      description="Mock mode — real Knowledge Base retrieval, simulated generation"
      actions={
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => setMessages([WELCOME])}
          disabled={messages.length <= 1}
        >
          <Eraser className="h-4 w-4" />
          <span className="hidden sm:inline">Clear chat</span>
        </Button>
      }
    >
      <div className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 shrink-0 text-cyan" />
          Responses are simulated — retrieval over your Knowledge Base is already real.
        </span>
        <span className="ml-auto rounded-full border border-border px-2.5 py-0.5 font-medium">
          {chunks.length} knowledge {chunks.length === 1 ? "entry" : "entries"} indexed
        </span>
      </div>

      {!isLoading && chunks.length === 0 && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-border bg-surface px-4 py-3">
          <p className="text-sm text-muted-foreground">
            Your Knowledge Base is empty, so the assistant has nothing to answer from.
          </p>
          <Button asChild size="sm">
            <Link to="/knowledge-base" search={{ tab: "faqs", new: true } as never}>
              Add your first entry
            </Link>
          </Button>
        </div>
      )}

      <div className="flex h-[62dvh] min-h-[420px] flex-col rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
        <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-3/4" />
              <Skeleton className="h-16 w-2/3" />
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.role === "user" ? "flex-row-reverse" : "flex-row",
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                    message.role === "user"
                      ? "bg-accent text-foreground"
                      : "bg-primary/10 text-primary",
                  )}
                >
                  {message.role === "user" ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </span>
                <div
                  className={cn(
                    "animate-fade-in max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface text-foreground",
                  )}
                >
                  <p className="whitespace-pre-wrap">{message.text}</p>

                  {message.role === "assistant" && message.confidence && (
                    <span
                      className={cn(
                        "mt-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                        CONFIDENCE_STYLE[message.confidence],
                      )}
                    >
                      {message.confidence === "none"
                        ? "no match"
                        : `${message.confidence} confidence`}
                    </span>
                  )}

                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-3 space-y-2 border-t border-border pt-2">
                      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        Sources
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {message.sources.map((source) => (
                          <Link
                            key={`${source.entity}-${source.id}`}
                            to="/knowledge-base"
                            search={{ tab: source.entity, new: false } as never}
                            className="rounded-full border border-border bg-card px-2.5 py-0.5 text-[11px] text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                          >
                            {source.title}
                            <span className="ml-1 opacity-70">({source.entity})</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}

          {thinking && (
            <div className="flex gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Bot className="h-4 w-4" />
              </span>
              <div className="flex items-center gap-1 rounded-2xl bg-surface px-4 py-4">
                {[0, 150, 300].map((delay) => (
                  <span
                    key={delay}
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground"
                    style={{ animationDelay: `${delay}ms` }}
                  />
                ))}
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="space-y-3 border-t border-border p-4 sm:p-5">
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => send(suggestion)}
                disabled={thinking}
                className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground disabled:opacity-50"
              >
                {suggestion}
              </button>
            ))}
          </div>
          <form
            className="flex gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              send(input);
            }}
          >
            <Input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask your assistant something…"
              className="h-11"
            />
            <Button type="submit" className="h-11 gap-2" disabled={thinking || !input.trim()}>
              <SendHorizonal className="h-4 w-4" />
              <span className="hidden sm:inline">Send</span>
            </Button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
