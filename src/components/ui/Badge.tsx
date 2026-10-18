import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type Tone = "gray" | "indigo" | "green" | "red" | "amber";

const toneClasses: Record<Tone, string> = {
  gray: "bg-slate-100 text-slate-700",
  indigo: "bg-indigo-50 text-indigo-700",
  green: "bg-emerald-50 text-emerald-700",
  red: "bg-red-50 text-red-700",
  amber: "bg-amber-50 text-amber-800",
};

interface BadgeProps extends ComponentProps<"span"> {
  tone?: Tone;
}

export function Badge({ tone = "gray", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}
