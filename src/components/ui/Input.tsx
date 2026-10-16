import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export const fieldClasses =
  "block w-full rounded-md border-0 bg-white px-3 py-2 text-sm text-slate-900 shadow-xs ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 disabled:bg-slate-50 disabled:text-slate-500 aria-invalid:ring-red-500";

// React 19: `ref` is a normal prop, so {...register("name")} (which includes a ref)
// reaches the <input> without forwardRef.
export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(fieldClasses, className)} {...props} />;
}
