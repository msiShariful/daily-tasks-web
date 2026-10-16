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
        "flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 px-6 py-10 text-center",
        className,
      )}
    >
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      {description && <div className="mt-1 text-sm text-slate-500">{description}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
