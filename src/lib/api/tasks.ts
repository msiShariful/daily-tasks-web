import { apiFetch } from "./client";
import type {
  PageResponse,
  TaskReorderRequest,
  TaskRequest,
  TaskResponse,
  TaskSearchParams,
  TaskStatusCode,
} from "./types";

export const tasksApi = {
  search: (params: TaskSearchParams = {}) =>
    apiFetch<PageResponse<TaskResponse>>("/tasks", { query: { ...params } }),

  get: (id: number) => apiFetch<TaskResponse>(`/tasks/${id}`),

  create: (request: TaskRequest) =>
    apiFetch<TaskResponse>("/tasks", { method: "POST", body: request }),

  update: (id: number, request: TaskRequest) =>
    apiFetch<TaskResponse>(`/tasks/${id}`, { method: "PUT", body: request }),

  updateStatus: (id: number, status: TaskStatusCode) =>
    apiFetch<TaskResponse>(`/tasks/${id}/status`, { method: "PATCH", body: { status } }),

  remove: (id: number) => apiFetch<void>(`/tasks/${id}`, { method: "DELETE" }),

  reorder: (request: TaskReorderRequest) =>
    apiFetch<void>("/tasks/reorder", { method: "POST", body: request }),
};
