"use client";

import { useQuery } from "@tanstack/react-query";
import { taskStatusesApi } from "@/lib/api/task-statuses";
import type { TaskStatusCode, TaskStatusResponse } from "@/lib/api/types";
import { queryKeys } from "@/lib/query-keys";
import { FALLBACK_TASK_STATUSES, findStatus } from "@/lib/task-status";

/** Statuses never change at runtime, so fetch once and keep forever. */
export function useTaskStatuses() {
  return useQuery({
    queryKey: queryKeys.taskStatuses,
    queryFn: taskStatusesApi.list,
    staleTime: Infinity,
    gcTime: Infinity,
    placeholderData: FALLBACK_TASK_STATUSES,
  });
}

/** Returns a lookup function: getStatus("DONE") -> { code, label, color }. */
export function useStatusLookup(): (code: TaskStatusCode) => TaskStatusResponse {
  const { data } = useTaskStatuses();
  const statuses = data ?? FALLBACK_TASK_STATUSES;
  return (code) => findStatus(statuses, code);
}
