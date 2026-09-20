import { Bot, CheckCircle2, SendHorizonal, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { generateMockReply } from "@/lib/ai/mock-engine";
import { loadKnowledgeChunks } from "@/lib/knowledge/api";
import { goalTitle, roleLabel } from "@/lib/onboarding/options";
import type { OnboardingDraft } from "@/lib/onboarding/types";
import { cn } from "@/lib/utils";

type ChatMessage = { id: string; role: "user" | "assistant"; text: string };

export function FinishStep({
  draft,
  done,
}: {
  draft: OnboardingDraft;
  done: boolean;
}) {
  if (done) return <CompletionCard draft={draft} />;
  return <TestChat draft={draft} />;
}

function TestChat({ draft }: { draft: OnboardingDraft }) {
  const name = draft.assistantName.trim() || "your assistant";
  const { data: chunks = [], isLoading } = useQuery({
    queryKey: ["kb", "chunks"],
    queryFn: loadKnowledgeChunks,
  });
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: draft.welcomeMessage.trim() || `Hi! I'm ${name}, your AI assistant. How can I help you today?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  function send() {
    const question = input.trim();
    if (!question || thinking || isLoading) return;
    setInput("");
    setMessages((prev) => [...prev, { id: `${Date.now()}-u`, role: "user", text: question }]);
    setThinking(true);
    window.setTimeout(() => {
      const reply = generateMockReply(question, chunks, {
        name,
        tone: draft.tone,
        instructions: draft.customInstructions,
      });
      setMessages((prev) => [...prev, { id: `${Date.now()}-a`, role: "assistant", text: reply.answer }]);
      setThinking(false);
    }, 550);
  }

  return (
    <div className="space-y-3">
      <div className="flex h-[420px] flex-col overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Bot className="h-4 w-4" aria-hidden />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">{name}</p>
            <p className="text-xs text-muted-foreground">{roleLabel(draft.assistantRole)}</p>
          </div>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn("flex gap-2", message.role === "user" ? "flex-row-reverse" : "flex-row")}
            >
              <span
                className={cn(
                  "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                  message.role === "user" ? "bg-accent" : "bg-primary/10 text-primary",
                )}
              >
                {message.role === "user" ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
              </span>
              <p
                className={cn(
                  "max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed",
                  message.role === "user"
                    ? "rounded-br-sm bg-primary text-primary-foreground"
                    : "rounded-bl-sm bg-surface text-foreground",
                )}
              >
                {message.text}
              </p>
            </div>
          ))}
          {thinking ? <p className="text-xs text-muted-foreground">Thinking…</p> : null}
          <div ref={endRef} />
        </div>
        <form
          className="flex gap-2 border-t border-border p-3"
          onSubmit={(event) => {
            event.preventDefault();
            send();
          }}
        >
          <Input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Type a message..."
            aria-label="Message"
            disabled={thinking || isLoading}
          />
          <Button type="submit" size="icon" disabled={!input.trim() || thinking || isLoading} aria-label="Send">
            <SendHorizonal className="h-4 w-4" />
          </Button>
        </form>
      </div>
      <p className="text-xs text-muted-foreground">
        Replies use your Knowledge Base. Generation is still in mock mode until the live model is connected — we
        will not invent answers that are not in your workspace.
      </p>
    </div>
  );
}

function CompletionCard({ draft }: { draft: OnboardingDraft }) {
  const items = [
    { label: "Organization configured" },
    { label: "AI assistant created" },
    { label: draft.knowledgeAdded ? "Knowledge added" : "Knowledge skipped" },
    {
      label: draft.channelConnected
        ? "Channel connected"
        : "Channel skipped",
    },
  ];

  return (
    <div>
      <ul className="space-y-3 text-sm">
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-3 text-foreground">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-success" aria-hidden />
            {item.label}
          </li>
        ))}
      </ul>
      {draft.industry || draft.goals.length ? (
        <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
          {draft.industry ? `${draft.industry}. ` : ""}
          {draft.goals.length ? draft.goals.map(goalTitle).slice(0, 3).join(" · ") : null}
        </p>
      ) : null}
      <div className="mt-8">
        <Button asChild variant="outline" className="h-11">
          <Link to="/knowledge-base" search={{ tab: "faqs", new: false } as never}>
            Continue setup
          </Link>
        </Button>
      </div>
    </div>
  );
}
