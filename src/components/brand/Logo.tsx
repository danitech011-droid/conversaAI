import { cn } from "@/lib/utils";

type LogoProps = {
  /** "full" = icon + wordmark stacked for auth screens; "mark" = icon only. */
  variant?: "full" | "mark";
  className?: string;
};

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 220 220"
      className={cn("h-9 w-9 shrink-0 rounded-[18px] bg-black", className)}
      aria-hidden
    >
      <rect x="0" y="0" width="220" height="220" rx="28" fill="#000000" />
      <circle cx="110" cy="110" r="82" fill="none" stroke="#ffffff" strokeWidth="18" strokeLinecap="round" />
      <path
        d="M54 142c20-13 36-28 51-46l18-26 42 7-4 32-33-10c-7 11-16 22-28 32l-33 17-13 12Z"
        fill="#ffffff"
      />
      <path d="M114 85 168 31l18 16-37 42 48 4-4 20-62-8 10-22Z" fill="#ffffff" />
    </svg>
  );
}

export function Logo({ variant = "full", className }: LogoProps) {
  if (variant === "mark") {
    return (
      <span className={cn("inline-flex", className)} role="img" aria-label="CLIMAX-AI">
        <BrandMark className="h-8 w-8" />
      </span>
    );
  }

  return (
    <div className={cn("flex items-center gap-4", className)} role="img" aria-label="CLIMAX-AI">
      <BrandMark className="h-16 w-16 text-foreground" />
      <span className="select-none text-4xl font-black tracking-[-0.08em] text-foreground">CLIMAX-AI</span>
    </div>
  );
}

export function LogoLockup({ className }: { className?: string }) {
  return (
    <span
      className={cn("inline-flex h-8 items-center gap-2.5 sm:h-9", className)}
      role="img"
      aria-label="CLIMAX-AI"
    >
      <BrandMark className="h-8 w-8 rounded-[10px] sm:h-9 sm:w-9" />
      <span className="select-none text-[1.05rem] font-black tracking-[-0.06em] text-foreground">
        CLIMAX-AI
      </span>
    </span>
  );
}
