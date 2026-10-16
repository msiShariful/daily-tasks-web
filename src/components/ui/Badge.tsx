import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type Tone = "gray" | "indigo" | "green" | "red" | "amber";

const toneClasses: Record<Tone, string> = {
  gray: "bg-slate-100 text-slate-700 ring-slate-500/20",
  indigo: "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
  green: "bg-green-50 text-green-700 ring-green-600/20",
  red: "bg-red-50 text-red-700 ring-red-600/20",
  amber: "bg-amber-50 text-amber-800 ring-amber-600/20",
};

interface BadgeProps extends ComponentProps<"span"> {
  tone?: Tone;
}

export function Badge({ tone = "gray", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}
