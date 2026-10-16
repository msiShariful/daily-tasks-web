"use client";

import { useStatusLookup } from "@/hooks/use-task-statuses";
import type { TaskStatusCode } from "@/lib/api/types";

/** Colored pill: the Google-Doc highlight color, as a badge. */
export function StatusBadge({ status }: { status: TaskStatusCode }) {
  const getStatus = useStatusLookup();
  const { label, color } = getStatus(status);
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium"
      // Dynamic colors from the API can't be Tailwind classes, so we use inline styles.
      style={{ backgroundColor: `${color}26`, color }}
    >
      <span aria-hidden="true" className="size-1.5 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-slate-800">{label}</span>
    </span>
  );
}
