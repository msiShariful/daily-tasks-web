import { TASK_STATUS_CODES, type TaskSearchParams, type TaskStatusCode } from "./api/types";
import { isIsoDate } from "./dates";

export const DEFAULT_PAGE_SIZE = 20;
export const DEFAULT_SORT = "workDate,desc";

export const SORT_OPTIONS = [
  { value: "workDate,desc", label: "Newest first" },
  { value: "workDate,asc", label: "Oldest first" },
] as const;

/** Minimal read-only interface shared by URLSearchParams and Next's ReadonlyURLSearchParams. */
interface SearchParamsLike {
  get(name: string): string | null;
}

function positiveInt(value: string | null): number | undefined {
  if (!value) return undefined;
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : undefined;
}

function isStatus(value: string | null): value is TaskStatusCode {
  return value !== null && (TASK_STATUS_CODES as readonly string[]).includes(value);
}

/**
 * URL (?search=login&status=DONE&page=2) -> typed API params.
 * Invalid values are ignored instead of crashing the page.
 * The URL uses 1-based "page" for humans; the API is 0-based.
 */
export function parseTaskSearchParams(searchParams: SearchParamsLike): TaskSearchParams {
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const status = searchParams.get("status");
  const sort = searchParams.get("sort");
  const page = positiveInt(searchParams.get("page")) ?? 1;

  return {
    search: searchParams.get("search")?.trim() || undefined,
    from: isIsoDate(from) ? from : undefined,
    to: isIsoDate(to) ? to : undefined,
    memberId: positiveInt(searchParams.get("memberId")),
    clientId: positiveInt(searchParams.get("clientId")),
    status: isStatus(status) ? status : undefined,
    sort: SORT_OPTIONS.some((option) => option.value === sort) ? (sort as string) : DEFAULT_SORT,
    page: page - 1,
    size: DEFAULT_PAGE_SIZE,
  };
}

/** Typed params -> "/tasks?search=...&page=2" (drops defaults and empty values). */
export function taskSearchHref(params: TaskSearchParams): string {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.from) query.set("from", params.from);
  if (params.to) query.set("to", params.to);
  if (params.memberId) query.set("memberId", String(params.memberId));
  if (params.clientId) query.set("clientId", String(params.clientId));
  if (params.status) query.set("status", params.status);
  if (params.sort && params.sort !== DEFAULT_SORT) query.set("sort", params.sort);
  if (params.page && params.page > 0) query.set("page", String(params.page + 1));
  const qs = query.toString();
  return qs ? `/tasks?${qs}` : "/tasks";
}
