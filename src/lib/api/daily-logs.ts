import { apiFetch } from "./client";
import type {
  CarryOverRequest,
  CarryOverResponse,
  DailyLogDaySummary,
  DailyLogResponse,
  IsoDate,
} from "./types";

export interface DayRange {
  from?: IsoDate;
  to?: IsoDate;
}

export const dailyLogsApi = {
  listDays: (range: DayRange = {}) =>
    apiFetch<DailyLogDaySummary[]>("/daily-logs", { query: { from: range.from, to: range.to } }),

  get: (date: IsoDate) => apiFetch<DailyLogResponse>(`/daily-logs/${date}`),

  carryOver: (date: IsoDate, request: CarryOverRequest) =>
    apiFetch<CarryOverResponse>(`/daily-logs/${date}/carry-over`, {
      method: "POST",
      body: request,
    }),
};
