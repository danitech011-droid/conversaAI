import { MessageSquare } from "lucide-react";

type BrandPreviewProps = {
  companyName: string;
  logoPreview: string | null;
  primaryColor: string;
  secondaryColor: string;
};

/**
 * Live preview of the customer-facing assistant using the business' own brand.
 * Inline styles are intentional here: these are user-chosen runtime colors.
 */
export function BrandPreview({
  companyName,
  logoPreview,
  primaryColor,
  secondaryColor,
}: BrandPreviewProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
      <div
        className="flex items-center gap-3 px-5 py-4"
        style={{ background: `linear-gradient(100deg, ${primaryColor}, ${secondaryColor})` }}
      >
        <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-white/90">
          {logoPreview ? (
            <img src={logoPreview} alt="" className="h-full w-full object-cover" />
          ) : (
            <MessageSquare className="h-4 w-4" style={{ color: primaryColor }} aria-hidden />
          )}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">
            {companyName || "Your company"}
          </p>
          <p className="text-xs text-white/80">Powered by ConversaAI</p>
        </div>
      </div>

      <div className="space-y-3 p-5 text-sm">
        <p className="w-fit max-w-[85%] rounded-2xl rounded-bl-sm bg-secondary px-4 py-2.5 text-secondary-foreground">
          Hi! I'm {companyName || "your"} assistant. How can I help today?
        </p>
        <p
          className="ml-auto w-fit max-w-[80%] rounded-2xl rounded-br-sm px-4 py-2.5 text-white"
          style={{ backgroundColor: primaryColor }}
        >
          What are your opening hours?
        </p>
        <p className="w-fit max-w-[85%] rounded-2xl rounded-bl-sm bg-secondary px-4 py-2.5 text-secondary-foreground">
          We're always available here — 24/7.
        </p>
      </div>

      <div className="border-t border-border px-5 py-3">
        <div className="flex items-center justify-between rounded-full border border-border bg-surface px-4 py-2">
          <span className="text-xs text-muted-foreground">Type a message…</span>
          <span
            className="inline-block h-6 w-6 rounded-full"
            style={{ backgroundColor: secondaryColor }}
            aria-hidden
          />
        </div>
      </div>
    </div>
  );
}
