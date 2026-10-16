"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api/client";
import { tasksApi } from "@/lib/api/tasks";
import type {
  DailyLogResponse,
  TaskReorderRequest,
  TaskRequest,
  TaskResponse,
  TaskSearchParams,
  TaskStatusCode,
} from "@/lib/api/types";
import { queryKeys } from "@/lib/query-keys";

// ---------- Queries ----------

/** Paginated search for the /tasks page. Keeps old rows visible while the next page loads. */
export function useTaskSearch(params: TaskSearchParams) {
  return useQuery({
    queryKey: queryKeys.tasks.search(params),
    queryFn: () => tasksApi.search(params),
    placeholderData: keepPreviousData,
  });
}

// ---------- Helpers ----------

/** Refresh everything that can show a task. */
function invalidateTaskViews(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.dailyLogs.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all }),
  ]);
}

/** Returns a copy of the daily log with `update` applied to every member section. */
function mapMembers(
  log: DailyLogResponse,
  update: (tasks: TaskResponse[], memberId: number) => TaskResponse[],
): DailyLogResponse {
  return {
    ...log,
    members: log.members.map((section) => {
      const tasks = update(section.tasks, section.member.id);
      return {
        ...section,
        tasks,
        total: tasks.length,
        done: tasks.filter((task) => task.status === "DONE").length,
      };
    }),
  };
}

// ---------- Mutations ----------

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: TaskRequest) => tasksApi.create(request),
    onSuccess: () => invalidateTaskViews(queryClient),
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, request }: { id: number; request: TaskRequest }) =>
      tasksApi.update(id, request),
    onSuccess: () => invalidateTaskViews(queryClient),
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (task: TaskResponse) => tasksApi.remove(task.id),
    onSuccess: () => invalidateTaskViews(queryClient),
  });
}

interface StatusChange {
  task: TaskResponse;
  status: TaskStatusCode;
}

/**
 * Optimistic status change: the new color shows immediately; if the server
 * says no, we roll back to the snapshot and show a toast.
 */
export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ task, status }: StatusChange) => tasksApi.updateStatus(task.id, status),

    onMutate: async ({ task, status }) => {
      const key = queryKeys.dailyLogs.detail(task.workDate);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<DailyLogResponse>(key);
      if (previous) {
        queryClient.setQueryData<DailyLogResponse>(
          key,
          mapMembers(previous, (tasks) =>
            tasks.map((t) => (t.id === task.id ? { ...t, status } : t)),
          ),
        );
      }
      return { previous, key };
    },

    onError: (error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(context.key, context.previous);
      }
      toast.error(getErrorMessage(error));
    },

    // Success or failure: re-sync with the server (also picks up the new `version`).
    onSettled: () => invalidateTaskViews(queryClient),
  });
}

/** Optimistic reorder within one member's list on one day. */
export function useReorderTasks() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: TaskReorderRequest) => tasksApi.reorder(request),

    onMutate: async (request) => {
      const key = queryKeys.dailyLogs.detail(request.workDate);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<DailyLogResponse>(key);
      if (previous) {
        queryClient.setQueryData<DailyLogResponse>(
          key,
          mapMembers(previous, (tasks, memberId) => {
            if (memberId !== request.teamMemberId) return tasks;
            const byId = new Map(tasks.map((task) => [task.id, task]));
            return request.taskIds
              .map((id, index) => {
                const task = byId.get(id);
                return task ? { ...task, position: index } : undefined;
              })
              .filter((task): task is TaskResponse => task !== undefined);
          }),
        );
      }
      return { previous, key };
    },

    onError: (error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(context.key, context.previous);
      }
      toast.error(getErrorMessage(error));
    },

    onSettled: (_data, _error, request) =>
      queryClient.invalidateQueries({ queryKey: queryKeys.dailyLogs.detail(request.workDate) }),
  });
}

/** Moves the task at `index` one step up (-1) or down (+1); returns the new id order. */
export function moveTaskIds(tasks: TaskResponse[], index: number, direction: -1 | 1): number[] {
  const ids = tasks.map((task) => task.id);
  const target = index + direction;
  if (target < 0 || target >= ids.length) return ids;
  [ids[index], ids[target]] = [ids[target], ids[index]];
  return ids;
}
