import type { ClientFilters } from "./api/clients";
import type { DayRange } from "./api/daily-logs";
import type { TeamMemberFilters } from "./api/team-members";
import type { IsoDate, TaskSearchParams } from "./api/types";

/**
 * Every TanStack Query cache key in one place.
 * Keys are arrays; invalidating a prefix (e.g. queryKeys.dailyLogs.all)
 * invalidates every key that starts with it.
 */
export const queryKeys = {
  teamMembers: {
    all: ["team-members"] as const,
    list: (filters: TeamMemberFilters) => ["team-members", "list", filters] as const,
    detail: (id: number) => ["team-members", "detail", id] as const,
  },
  clients: {
    all: ["clients"] as const,
    list: (filters: ClientFilters) => ["clients", "list", filters] as const,
    detail: (id: number) => ["clients", "detail", id] as const,
    archived: (filters: Omit<ClientFilters, "active">) => ["clients", "archived", filters] as const,
  },
  taskStatuses: ["task-statuses"] as const,
  tasks: {
    all: ["tasks"] as const,
    search: (params: TaskSearchParams) => ["tasks", "search", params] as const,
    detail: (id: number) => ["tasks", "detail", id] as const,
  },
  dailyLogs: {
    all: ["daily-logs"] as const,
    days: (range: DayRange) => ["daily-logs", "days", range] as const,
    detail: (date: IsoDate) => ["daily-logs", "detail", date] as const,
  },
};
