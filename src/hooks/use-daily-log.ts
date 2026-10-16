"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { dailyLogsApi, type DayRange } from "@/lib/api/daily-logs";
import type { CarryOverRequest, IsoDate } from "@/lib/api/types";
import { queryKeys } from "@/lib/query-keys";

/** Days that have tasks (the Google-Doc "tabs"). Defaults to the last 60 days. */
export function useDailyLogDays(range: DayRange = {}) {
  return useQuery({
    queryKey: queryKeys.dailyLogs.days(range),
    queryFn: () => dailyLogsApi.listDays(range),
  });
}

/** One day: every member with their tasks. */
export function useDailyLog(date: IsoDate) {
  return useQuery({
    queryKey: queryKeys.dailyLogs.detail(date),
    queryFn: () => dailyLogsApi.get(date),
  });
}

/** Copies unfinished tasks from an earlier day into `date`. */
export function useCarryOver(date: IsoDate) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CarryOverRequest) => dailyLogsApi.carryOver(date, request),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.dailyLogs.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all }),
      ]),
  });
}
