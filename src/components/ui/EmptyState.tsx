import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white/60 px-6 py-12 text-center",
        className,
      )}
    >
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      {description && <div className="mt-1 text-sm text-slate-500">{description}</div>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
