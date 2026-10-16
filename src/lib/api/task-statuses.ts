import { apiFetch } from "./client";
import type { TaskStatusResponse } from "./types";

export const taskStatusesApi = {
  list: () => apiFetch<TaskStatusResponse[]>("/task-statuses"),
};
