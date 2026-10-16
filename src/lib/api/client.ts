import type { ProblemDetail } from "./types";

/** Every API call goes through the Next.js rewrite: /api/v1/... -> Spring Boot. */
export const API_BASE_URL = "/api/v1";

/**
 * Error thrown by apiFetch for every non-2xx response (and for network failures).
 * It carries the parsed RFC 9457 problem details and Laravel-style field errors.
 */
export class ApiError extends Error {
  /** HTTP status code. 0 means the request never reached the server. */
  readonly status: number;
  /** Parsed application/problem+json body, if the server sent one. */
  readonly problem: ProblemDetail | null;
  /** Field errors from a 400 validation response: { fieldName: ["message"] }. */
  readonly fieldErrors: Record<string, string[]>;

  constructor(status: number, problem: ProblemDetail | null, fallbackMessage: string) {
    super(problem?.detail ?? problem?.title ?? fallbackMessage);
    this.name = "ApiError";
    this.status = status;
    this.problem = problem;
    this.fieldErrors = problem?.errors ?? {};
  }

  get isNetworkError(): boolean {
    return this.status === 0;
  }

  get isValidationError(): boolean {
    return this.status === 400 && Object.keys(this.fieldErrors).length > 0;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  get isConflict(): boolean {
    return this.status === 409;
  }
}

export type QueryValue = string | number | boolean | null | undefined;
export type QueryParams = Record<string, QueryValue>;

export interface ApiFetchOptions extends Omit<RequestInit, "body"> {
  /** Plain object/array: sent as JSON. */
  body?: unknown;
  /** Appended as ?key=value; null/undefined/"" values are skipped. */
  query?: QueryParams;
}

/** Builds "?a=1&b=x" from an object, skipping empty values. Returns "" when nothing is set. */
export function buildQueryString(query?: QueryParams): string {
  if (!query) return "";
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    params.append(key, String(value));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

async function parseBody(response: Response): Promise<unknown> {
  if (response.status === 204) return undefined;
  const text = await response.text();
  if (!text) return undefined;
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("json")) {
    try {
      return JSON.parse(text) as unknown;
    } catch {
      return text;
    }
  }
  return text;
}

function toProblem(body: unknown): ProblemDetail | null {
  if (body && typeof body === "object" && !Array.isArray(body)) {
    return body as ProblemDetail;
  }
  return null;
}

/**
 * The ONE place in the app where fetch() is called.
 *
 *   const tasks = await apiFetch<TaskResponse[]>("/tasks", { query: { date: "2026-10-14" } });
 *   await apiFetch<TaskResponse>("/tasks", { method: "POST", body: request });
 *
 * - prefixes the path with /api/v1
 * - JSON-encodes `body` and sets the headers
 * - returns the parsed JSON (or undefined for 204 No Content)
 * - throws ApiError for any non-2xx status or network failure
 */
export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { body, query, headers, ...rest } = options;

  const requestHeaders = new Headers(headers);
  requestHeaders.set("Accept", "application/json, application/problem+json");
  if (body !== undefined) {
    requestHeaders.set("Content-Type", "application/json");
  }

  const url = `${API_BASE_URL}${path}${buildQueryString(query)}`;

  let response: Response;
  try {
    response = await fetch(url, {
      ...rest,
      headers: requestHeaders,
      body: body === undefined ? undefined : JSON.stringify(body),
      credentials: "same-origin",
      cache: "no-store",
    });
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === "AbortError") {
      throw cause; // TanStack Query cancelled the request; not a real error
    }
    throw new ApiError(0, null, "Cannot reach the server. Is the API running?");
  }

  const data = await parseBody(response);

  if (!response.ok) {
    const fallback =
      typeof data === "string" && data.length > 0 && data.length < 300
        ? data
        : `Request failed with status ${response.status}`;
    throw new ApiError(response.status, toProblem(data), fallback);
  }

  return data as T;
}

/** Turns any thrown value into a message you can show in a toast. */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.isValidationError) {
      const first = Object.values(error.fieldErrors)[0]?.[0];
      return first ? `Please fix the form: ${first}` : error.message;
    }
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}
