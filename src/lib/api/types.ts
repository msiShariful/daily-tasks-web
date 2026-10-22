// TypeScript mirrors of the Spring Boot DTOs (SPEC §5).
// Dates are "yyyy-MM-dd" strings, timestamps are ISO-8601 UTC strings.

export type IsoDate = string; // e.g. "2026-10-14"
export type IsoInstant = string; // e.g. "2026-10-14T06:30:00Z"

// ---------- Common ----------

export interface PageResponse<T> {
  content: T[];
  page: number; // 0-based
  size: number;
  totalElements: number;
  totalPages: number;
}

/** RFC 9457 problem details returned by Spring's GlobalExceptionHandler. */
export interface ProblemDetail {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  /** Validation errors (400): { "fieldName": ["message", ...] } */
  errors?: Record<string, string[]>;
}

// ---------- Team members ----------

export interface TeamMemberSummary {
  id: number;
  fullName: string;
}

export interface TeamMemberResponse {
  id: number;
  fullName: string;
  email: string;
  designation: string | null;
  active: boolean;
  displayOrder: number;
  createdAt: IsoInstant;
  updatedAt: IsoInstant;
}

export interface TeamMemberRequest {
  fullName: string;
  email: string;
  designation: string | null;
  active: boolean;
  displayOrder: number;
}

// ---------- Clients ----------

export interface ClientSummary {
  id: number;
  name: string;
  ticketId: number;
}

export interface ClientResponse {
  id: number;
  name: string;
  ticketId: number;
  notes: string | null;
  active: boolean;
  createdAt: IsoInstant;
  updatedAt: IsoInstant;
}

export interface ClientRequest {
  name: string;
  ticketId: number;
  notes: string | null;
  active: boolean;
}

// ---------- Task statuses ----------

export const TASK_STATUS_CODES = [
  "TODO",
  "IN_PROGRESS",
  "IN_REVIEW",
  "DONE",
  "BLOCKED",
  "ON_HOLD",
] as const;

export type TaskStatusCode = (typeof TASK_STATUS_CODES)[number];

export interface TaskStatusResponse {
  code: TaskStatusCode;
  label: string;
  color: string; // hex, e.g. "#22C55E"
}

// ---------- Tasks ----------

export interface TaskLinkResponse {
  id: number;
  label: string | null;
  url: string;
}

export interface TaskLinkRequest {
  label: string | null;
  url: string;
}

export interface TaskResponse {
  id: number;
  workDate: IsoDate;
  teamMember: TeamMemberSummary;
  client: ClientSummary | null;
  taskCode: string | null;
  title: string;
  details: string | null;
  status: TaskStatusCode;
  position: number;
  links: TaskLinkResponse[];
  carriedOverFromId: number | null;
  version: number;
  createdAt: IsoInstant;
  updatedAt: IsoInstant;
}

export interface TaskRequest {
  workDate: IsoDate;
  teamMemberId: number;
  clientId: number | null;
  taskCode: string | null;
  title: string;
  details: string | null;
  status: TaskStatusCode;
  links: TaskLinkRequest[];
  version?: number; // required on PUT
}

export interface TaskStatusUpdateRequest {
  status: TaskStatusCode;
}

export interface TaskReorderRequest {
  workDate: IsoDate;
  teamMemberId: number;
  taskIds: number[];
}

/** Query parameters accepted by GET /api/v1/tasks */
export interface TaskSearchParams {
  date?: IsoDate;
  from?: IsoDate;
  to?: IsoDate;
  memberId?: number;
  clientId?: number;
  status?: TaskStatusCode;
  search?: string;
  page?: number;
  size?: number;
  sort?: string; // e.g. "workDate,desc"
}

// ---------- Daily logs ----------

export interface DailyLogDaySummary {
  date: IsoDate;
  taskCount: number;
  doneCount: number;
}

export interface MemberTasksResponse {
  member: TeamMemberSummary;
  tasks: TaskResponse[];
  total: number;
  done: number;
}

export interface DailyLogResponse {
  date: IsoDate;
  members: MemberTasksResponse[];
}

export interface CarryOverRequest {
  fromDate?: IsoDate | null;
  memberId?: number | null;
}

export interface CarryOverResponse {
  /** null when there was no earlier day with tasks to copy from */
  fromDate: IsoDate | null;
  toDate: IsoDate;
  copied: number;
}
