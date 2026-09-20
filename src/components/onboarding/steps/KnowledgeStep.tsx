import { FileText, Globe, Plus, Type } from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { TextField } from "@/components/form/Fields";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getCompanyInfo, getKnowledgeCounts, saveCompanyInfo, saveFaq, saveProduct, saveService } from "@/lib/knowledge/api";
import { cn } from "@/lib/utils";

type Pane = "manual" | "website" | "files";

export function KnowledgeStep({
  website,
  onKnowledgeAdded,
}: {
  website: string;
  onKnowledgeAdded: () => void;
}) {
  const [pane, setPane] = useState<Pane>("manual");
  const { data: counts } = useQuery({ queryKey: ["kb", "counts"], queryFn: getKnowledgeCounts });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-2 rounded-xl border border-border bg-surface p-1">
        {(
          [
            { id: "manual", label: "Manual", icon: Type },
            { id: "website", label: "Website", icon: Globe },
            { id: "files", label: "Files", icon: FileText },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setPane(item.id)}
            className={cn(
              "flex items-center justify-center gap-2 rounded-lg px-2 py-2.5 text-xs font-medium transition-colors sm:text-sm",
              pane === item.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <item.icon className="h-4 w-4" aria-hidden />
            {item.label}
          </button>
        ))}
      </div>

      {counts && counts.total > 0 ? (
        <p className="text-sm text-muted-foreground">
          {counts.total} knowledge {counts.total === 1 ? "entry" : "entries"} in this workspace so far.
        </p>
      ) : null}

      {pane === "manual" ? <ManualKnowledge onAdded={onKnowledgeAdded} /> : null}
      {pane === "website" ? <WebsiteImport website={website} /> : null}
      {pane === "files" ? <FilesSoon /> : null}
    </div>
  );
}

function ManualKnowledge({ onAdded }: { onAdded: () => void }) {
  const queryClient = useQueryClient();
  const [faq, setFaq] = useState({ question: "", answer: "" });
  const [org, setOrg] = useState("");
  const [product, setProduct] = useState({ name: "", description: "" });
  const [service, setService] = useState({ name: "", description: "" });

  const { data: company } = useQuery({ queryKey: ["kb", "company"], queryFn: getCompanyInfo });

  const addFaq = useMutation({
    mutationFn: async () => {
      if (!faq.question.trim() || !faq.answer.trim()) throw new Error("Add both a question and an answer.");
      await saveFaq({ question: faq.question.trim(), answer: faq.answer.trim(), status: "published" });
    },
    onSuccess: () => {
      toast.success("FAQ added");
      setFaq({ question: "", answer: "" });
      onAdded();
      queryClient.invalidateQueries({ queryKey: ["kb"] });
    },
    onError: (error: Error) => toast.error("Couldn't save FAQ", { description: error.message }),
  });

  const saveOrg = useMutation({
    mutationFn: async () => {
      if (!org.trim()) throw new Error("Add a short description of the organisation.");
      await saveCompanyInfo({
        ...(company?.id ? { id: company.id } : {}),
        ...(company?.company_name ? { company_name: company.company_name } : {}),
        description: org.trim(),
      });
    },
    onSuccess: () => {
      toast.success("Organisation information saved");
      onAdded();
      queryClient.invalidateQueries({ queryKey: ["kb"] });
    },
    onError: (error: Error) => toast.error("Couldn't save", { description: error.message }),
  });

  const addProduct = useMutation({
    mutationFn: async () => {
      if (!product.name.trim()) throw new Error("Enter a product name.");
      await saveProduct({ name: product.name.trim(), description: product.description.trim() || null });
    },
    onSuccess: () => {
      toast.success("Product added");
      setProduct({ name: "", description: "" });
      onAdded();
      queryClient.invalidateQueries({ queryKey: ["kb"] });
    },
    onError: (error: Error) => toast.error("Couldn't save product", { description: error.message }),
  });

  const addService = useMutation({
    mutationFn: async () => {
      if (!service.name.trim()) throw new Error("Enter a service name.");
      await saveService({ name: service.name.trim(), description: service.description.trim() || null });
    },
    onSuccess: () => {
      toast.success("Service added");
      setService({ name: "", description: "" });
      onAdded();
      queryClient.invalidateQueries({ queryKey: ["kb"] });
    },
    onError: (error: Error) => toast.error("Couldn't save service", { description: error.message }),
  });

  return (
    <div className="space-y-4">
      <KnowledgeBlock title="FAQ">
        <TextField
          label="Question"
          value={faq.question}
          onChange={(event) => setFaq((current) => ({ ...current, question: event.target.value }))}
          placeholder="What are your opening hours?"
        />
        <div className="space-y-1.5">
          <Label htmlFor="faq-answer">Answer</Label>
          <Textarea
            id="faq-answer"
            rows={3}
            value={faq.answer}
            onChange={(event) => setFaq((current) => ({ ...current, answer: event.target.value }))}
            placeholder="We're open Monday to Friday, 9am–6pm."
          />
        </div>
        <Button type="button" size="sm" className="gap-2" onClick={() => addFaq.mutate()} disabled={addFaq.isPending}>
          <Plus className="h-4 w-4" />
          Add FAQ
        </Button>
      </KnowledgeBlock>

      <KnowledgeBlock title="Organisation information">
        <div className="space-y-1.5">
          <Label htmlFor="org-info">About the organisation</Label>
          <Textarea
            id="org-info"
            rows={3}
            value={org}
            onChange={(event) => setOrg(event.target.value)}
            placeholder="Who you are, who you serve, and what you want the assistant to know."
          />
        </div>
        <Button type="button" size="sm" className="gap-2" onClick={() => saveOrg.mutate()} disabled={saveOrg.isPending}>
          Save information
        </Button>
      </KnowledgeBlock>

      <KnowledgeBlock title="Product">
        <TextField
          label="Name"
          value={product.name}
          onChange={(event) => setProduct((current) => ({ ...current, name: event.target.value }))}
          placeholder="Starter plan"
        />
        <TextField
          label="Short description"
          value={product.description}
          onChange={(event) => setProduct((current) => ({ ...current, description: event.target.value }))}
          placeholder="Optional details, price or availability"
        />
        <Button type="button" size="sm" className="gap-2" onClick={() => addProduct.mutate()} disabled={addProduct.isPending}>
          <Plus className="h-4 w-4" />
          Add product
        </Button>
      </KnowledgeBlock>

      <KnowledgeBlock title="Service">
        <TextField
          label="Name"
          value={service.name}
          onChange={(event) => setService((current) => ({ ...current, name: event.target.value }))}
          placeholder="Consultation"
        />
        <TextField
          label="Short description"
          value={service.description}
          onChange={(event) => setService((current) => ({ ...current, description: event.target.value }))}
          placeholder="Optional duration or pricing"
        />
        <Button type="button" size="sm" className="gap-2" onClick={() => addService.mutate()} disabled={addService.isPending}>
          <Plus className="h-4 w-4" />
          Add service
        </Button>
      </KnowledgeBlock>
    </div>
  );
}

function KnowledgeBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3 rounded-2xl border border-border bg-card p-4 sm:p-5">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      {children}
    </section>
  );
}

function WebsiteImport({ website }: { website: string }) {
  const [url, setUrl] = useState(website);
  const [confirmed, setConfirmed] = useState(false);

  return (
    <section className="space-y-4 rounded-2xl border border-border bg-card p-5">
      <div>
        <h2 className="text-sm font-semibold text-foreground">Import from website</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Analyse a site you own, review discovered pages, then import only what you select.
        </p>
      </div>
      <TextField
        label="Website URL"
        type="url"
        value={url}
        onChange={(event) => setUrl(event.target.value)}
        placeholder="https://yourwebsite.com"
      />
      <label className="flex items-start gap-2 text-sm text-muted-foreground">
        <input
          type="checkbox"
          className="mt-1"
          checked={confirmed}
          onChange={(event) => setConfirmed(event.target.checked)}
        />
        I own this website or I am authorised to connect it to ConversaAI.
      </label>
      <Button type="button" disabled className="h-11">
        Analyze website
      </Button>
      <p className="rounded-xl bg-muted px-3 py-2 text-xs leading-relaxed text-muted-foreground">
        Website analysis is not connected yet. This step is ready for the crawler — it will list pages for you to
        choose before anything is imported. Nothing has been fetched.
      </p>
    </section>
  );
}

function FilesSoon() {
  return (
    <section className="rounded-2xl border border-dashed border-border bg-surface px-5 py-8 text-center">
      <FileText className="mx-auto h-6 w-6 text-muted-foreground" aria-hidden />
      <h2 className="mt-3 text-sm font-semibold text-foreground">File uploads coming soon</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
        PDF, DOCX and TXT knowledge sources will land here once document processing is available. Add FAQs or
        organisation details for now.
      </p>
    </section>
  );
}
