import type { ReactNode } from "react";
import { FieldError } from "./FieldError";
import { Label } from "./Label";

interface FormFieldProps {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}

/** Label + input + hint + error, stacked. The input itself is passed as children. */
export function FormField({ id, label, required, error, hint, children, className }: FormFieldProps) {
  return (
    <div className={className}>
      <Label htmlFor={id} required={required}>
        {label}
      </Label>
      <div className="mt-1">{children}</div>
      {hint && !error && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}
