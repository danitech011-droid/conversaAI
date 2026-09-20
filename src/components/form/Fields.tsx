import { forwardRef, useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type FieldProps = React.ComponentProps<"input"> & {
  label: string;
  error?: string | undefined;
  hint?: string | undefined;
};

export const TextField = forwardRef<HTMLInputElement, FieldProps>(function TextField(
  { label, error, hint, id, className, ...props },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;

  return (
    <div className="space-y-1.5">
      <Label htmlFor={inputId}>{label}</Label>
      <Input
        id={inputId}
        ref={ref}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : hint ? hintId : undefined}
        className={cn("h-11", className)}
        {...props}
      />
      {hint && !error ? (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-xs font-medium text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
});

export function PasswordField({ label, error, hint, id, ...props }: FieldProps) {
  const [visible, setVisible] = useState(false);
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className="relative">
      <TextField
        {...props}
        id={inputId}
        label={label}
        error={error}
        hint={hint}
        type={visible ? "text" : "password"}
        className="h-11 pr-11"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute right-1 top-[26px] inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}
