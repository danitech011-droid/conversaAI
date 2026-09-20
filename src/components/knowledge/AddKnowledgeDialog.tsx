import {
  Boxes,
  FileText,
  HelpCircle,
  ImageIcon,
  Plus,
  Wrench,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { KnowledgeFilter } from "@/lib/knowledge/types";
import { cn } from "@/lib/utils";

const OPTIONS = [
  {
    type: "general" as const,
    title: "General information",
    description: "Information about your organization.",
    icon: FileText,
  },
  {
    type: "faqs" as const,
    title: "FAQ",
    description: "Questions and answers your AI can quote directly.",
    icon: HelpCircle,
  },
  {
    type: "products" as const,
    title: "Product",
    description: "Add a product to your knowledge base.",
    icon: Boxes,
  },
  {
    type: "services" as const,
    title: "Service",
    description: "Describe what you offer and how customers can buy it.",
    icon: Wrench,
  },
  {
    type: "images" as const,
    title: "Image",
    description: "Upload an image associated with your knowledge.",
    icon: ImageIcon,
  },
] as const;

export function AddKnowledgeDialog({
  open,
  onOpenChange,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (type: KnowledgeFilter) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add knowledge</DialogTitle>
          <DialogDescription>What would you like to add?</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 py-2">
          {OPTIONS.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.type}
                type="button"
                onClick={() => {
                  onSelect(option.type);
                  onOpenChange(false);
                }}
                className={cn(
                  "flex items-start gap-3 rounded-xl border border-border bg-card px-4 py-3 text-left transition-colors",
                  "hover:border-primary/40 hover:bg-surface",
                )}
              >
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-foreground">{option.title}</span>
                  <span className="mt-0.5 block text-sm text-muted-foreground">
                    {option.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function AddKnowledgeButton({ onClick }: { onClick: () => void }) {
  return (
    <Button className="h-11 gap-2" onClick={onClick}>
      <Plus className="h-4 w-4" />
      Add knowledge
    </Button>
  );
}
