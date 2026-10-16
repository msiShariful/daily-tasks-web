import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

interface LabelProps extends ComponentProps<"label"> {
  required?: boolean;
}

export function Label({ className, children, required, ...props }: LabelProps) {
  return (
    <label className={cn("block text-sm font-medium text-slate-700", className)} {...props}>
      {children}
      {required && (
        <span className="ml-0.5 text-red-600" aria-hidden="true">
          *
        </span>
      )}
    </label>
  );
}
