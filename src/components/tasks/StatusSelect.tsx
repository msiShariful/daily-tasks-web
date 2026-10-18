"use client";

import { useStatusLookup, useTaskStatuses } from "@/hooks/use-task-statuses";
import { useUpdateTaskStatus } from "@/hooks/use-tasks";
import type { TaskResponse, TaskStatusCode } from "@/lib/api/types";
import { FALLBACK_TASK_STATUSES } from "@/lib/task-status";

/** Changes a task's status in one click (optimistic: the color changes instantly). */
export function StatusSelect({ task }: { task: TaskResponse }) {
  const { data: statuses = FALLBACK_TASK_STATUSES } = useTaskStatuses();
  const getStatus = useStatusLookup();
  const updateStatus = useUpdateTaskStatus();
  const current = getStatus(task.status);

  return (
    <div className="relative inline-flex items-center">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-2 size-2.5 rounded-full"
        style={{ backgroundColor: current.color }}
      />
      <select
        aria-label={`Status of "${task.title}"`}
        value={task.status}
        onChange={(event) =>
          updateStatus.mutate({ task, status: event.target.value as TaskStatusCode })
        }
        className="h-8 rounded-lg border-0 bg-white py-0 pl-6 pr-7 text-xs font-medium text-slate-800 ring-1 ring-inset ring-slate-200 transition-[box-shadow] hover:ring-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:shadow-[0_0_0_4px_rgb(99_102_241/0.12)]"
      >
        {statuses.map((status) => (
          <option key={status.code} value={status.code}>
            {status.label}
          </option>
        ))}
      </select>
    </div>
  );
}
