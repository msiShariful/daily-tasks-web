"use client";

import { Badge } from "@/components/ui/Badge";
import { useStatusLookup } from "@/hooks/use-task-statuses";
import type { TaskResponse } from "@/lib/api/types";
import { StatusSelect } from "./StatusSelect";

interface TaskCardProps {
  task: TaskResponse;
}

/** One task row: colored edge = status, like the highlight color in the old Google Doc. */
export function TaskCard({ task }: TaskCardProps) {
  const getStatus = useStatusLookup();
  const status = getStatus(task.status);

  return (
    <li
      className="group rounded-md border-l-4 bg-white px-3 py-2.5 shadow-xs ring-1 ring-slate-200"
      style={{ borderLeftColor: status.color }}
    >
      <div className="flex flex-wrap items-start gap-x-3 gap-y-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            {task.taskCode && (
              <Badge tone="indigo" className="font-mono">
                {task.taskCode}
              </Badge>
            )}
            {task.client ? <Badge>{task.client.name}</Badge> : <Badge tone="amber">Internal</Badge>}
            {task.carriedOverFromId !== null && (
              <Badge title="Copied from an earlier day" tone="gray">
                ↻ carried over
              </Badge>
            )}
          </div>
          <p
            className={
              task.status === "DONE"
                ? "mt-1 text-sm font-medium text-slate-500 line-through decoration-slate-400"
                : "mt-1 text-sm font-medium text-slate-900"
            }
          >
            {task.title}
          </p>
          {task.details && (
            <p className="mt-0.5 line-clamp-2 whitespace-pre-line text-xs text-slate-500">
              {task.details}
            </p>
          )}
          {task.links.length > 0 && (
            <ul className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
              {task.links.map((link) => (
                <li key={link.id}>
                  {/* External links: a plain <a>, not next/link (that's for in-app navigation). */}
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
                  >
                    {link.label || shortUrl(link.url)} ↗
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex items-center gap-1">
          <StatusSelect task={task} />
        </div>
      </div>
    </li>
  );
}

function shortUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname + (parsed.pathname.length > 1 ? parsed.pathname : "");
  } catch {
    return url;
  }
}
