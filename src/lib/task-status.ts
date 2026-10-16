import type { TaskStatusCode, TaskStatusResponse } from "./api/types";

/**
 * Same values as the backend TaskStatus enum. Used as placeholder data
 * until GET /task-statuses answers, so colors render instantly.
 */
export const FALLBACK_TASK_STATUSES: TaskStatusResponse[] = [
  { code: "TODO", label: "To do", color: "#9CA3AF" },
  { code: "IN_PROGRESS", label: "In progress", color: "#F59E0B" },
  { code: "IN_REVIEW", label: "In review", color: "#3B82F6" },
  { code: "DONE", label: "Done", color: "#22C55E" },
  { code: "BLOCKED", label: "Blocked", color: "#EF4444" },
  { code: "ON_HOLD", label: "On hold", color: "#A855F7" },
];

export function findStatus(
  statuses: TaskStatusResponse[],
  code: TaskStatusCode,
): TaskStatusResponse {
  return (
    statuses.find((status) => status.code === code) ??
    FALLBACK_TASK_STATUSES.find((status) => status.code === code) ?? {
      code,
      label: code,
      color: "#9CA3AF",
    }
  );
}
