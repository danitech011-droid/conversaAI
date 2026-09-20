import { cn } from "@/lib/utils";

type LogoProps = {
  /** "full" = icon + wordmark stacked for auth screens; "mark" = icon only. */
  variant?: "full" | "mark";
  className?: string;
};

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={cn("h-9 w-9 shrink-0", className)}
      aria-hidden
    >
      <defs>
        <linearGradient id="conversaiIconGrad" x1="6" y1="4" x2="34" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1e3a5f" />
          <stop offset="0.55" stopColor="#2563eb" />
          <stop offset="1" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill="url(#conversaiIconGrad)" />
      <path fill="#fff" d="M12.5 13.5c0-1.7 1.4-3 3-3h9c1.7 0 3 1.3 3 3v7.2c0 1.7-1.3 3-3 3H20l-4.2 3.2c-.5.4-1.3 0-1.3-.6v-2.6c-1.7 0-3-1.3-3-3v-7.2Z" />
      <circle cx="17.2" cy="17.4" r="1.35" fill="#06b6d4" />
      <circle cx="20.5" cy="17.4" r="1.35" fill="#06b6d4" />
      <circle cx="23.8" cy="17.4" r="1.35" fill="#06b6d4" />
      <path fill="#67e8f9" d="M29.2 9.2 29.9 11 31.8 11.2 30.4 12.4 30.8 14.2 29.2 13.2 27.6 14.2 28 12.4 26.6 11.2 28.5 11Z" />
    </svg>
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
