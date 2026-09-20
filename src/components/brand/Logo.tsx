import { cn } from "@/lib/utils";

type LogoProps = {
  /** "full" = icon + wordmark stacked for auth screens; "mark" = icon only. */
  variant?: "full" | "mark";
  className?: string;
};

export function BrandMark({ className }: { className?: string }) {
  return (
    <span className={cn("relative h-9 w-9 shrink-0 overflow-hidden", className)} aria-hidden>
      <img
        src="/conversai-logo.svg"
        alt=""
        className="absolute left-[-7px] top-0 h-[63px] w-[54px] max-w-none"
      />
    </span>
  );
}

export function Logo({ variant = "full", className }: LogoProps) {
  if (variant === "mark") {
    return (
      <span className={cn("inline-flex", className)} role="img" aria-label="ConversaAI">
        <BrandMark className="h-8 w-8" />
      </span>
    );
  }

  return (
    <img
      src="/conversai-logo.svg"
      alt="ConversaAI — Your Business Never Sleeps"
      className={cn("inline-block w-52 max-w-full object-contain", className)}
    />
  );
}

export function LogoLockup({ className }: { className?: string }) {
  return (
    <span
      className={cn("inline-flex h-8 items-center gap-2.5 sm:h-9", className)}
      role="img"
      aria-label="ConversaAI"
    >
      <BrandMark className="h-8 w-8 rounded-[10px] sm:h-9 sm:w-9" />
      <span className="select-none text-[1.05rem] font-bold tracking-tight text-navy dark:text-slate-50">
        Conversa<span className="text-cyan">AI</span>
      </span>
    </span>
  );
}
