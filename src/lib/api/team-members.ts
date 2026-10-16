import { apiFetch } from "./client";
import type { TeamMemberRequest, TeamMemberResponse } from "./types";

export interface TeamMemberFilters {
  active?: boolean;
}

export const teamMembersApi = {
  list: (filters: TeamMemberFilters = {}) =>
    apiFetch<TeamMemberResponse[]>("/team-members", { query: { active: filters.active } }),

  get: (id: number) => apiFetch<TeamMemberResponse>(`/team-members/${id}`),

  create: (request: TeamMemberRequest) =>
    apiFetch<TeamMemberResponse>("/team-members", { method: "POST", body: request }),

  update: (id: number, request: TeamMemberRequest) =>
    apiFetch<TeamMemberResponse>(`/team-members/${id}`, { method: "PUT", body: request }),

  remove: (id: number) => apiFetch<void>(`/team-members/${id}`, { method: "DELETE" }),
};
