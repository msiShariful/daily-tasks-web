import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export const fieldClasses = cn(
  "block w-full rounded-lg border-0 bg-white px-3 py-2 text-sm text-slate-900 ring-1 ring-inset ring-slate-200",
  "transition-[box-shadow,background-color] placeholder:text-slate-400 hover:ring-slate-300",
  "focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 focus:shadow-[0_0_0_4px_rgb(99_102_241/0.12)]",
  "disabled:bg-slate-50 disabled:text-slate-500 disabled:hover:ring-slate-200",
  "aria-invalid:ring-red-500 aria-invalid:focus:shadow-[0_0_0_4px_rgb(239_68_68/0.12)]",
);

// React 19: `ref` is a normal prop, so {...register("name")} (which includes a ref)
// reaches the <input> without forwardRef.
export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(fieldClasses, className)} {...props} />;
}
