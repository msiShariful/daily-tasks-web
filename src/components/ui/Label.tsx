import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

interface LabelProps extends ComponentProps<"label"> {
  required?: boolean;
}

export function Label({ className, children, required, ...props }: LabelProps) {
  return (
    <label className={cn("block text-sm font-medium text-slate-800", className)} {...props}>
      {children}
      {required && (
        <span className="ml-0.5 text-red-500" aria-hidden="true">
          *
        </span>
      )}
    </label>
  );
}
