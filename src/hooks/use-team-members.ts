"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { teamMembersApi, type TeamMemberFilters } from "@/lib/api/team-members";
import type { TeamMemberRequest } from "@/lib/api/types";
import { queryKeys } from "@/lib/query-keys";

export function useTeamMembers(filters: TeamMemberFilters = {}) {
  return useQuery({
    queryKey: queryKeys.teamMembers.list(filters),
    queryFn: () => teamMembersApi.list(filters),
  });
}

export function useTeamMember(id: number | undefined) {
  return useQuery({
    queryKey: queryKeys.teamMembers.detail(id ?? 0),
    queryFn: () => teamMembersApi.get(id as number),
    enabled: id !== undefined,
  });
}

/** After any write, refresh member lists and the daily logs (they list members). */
function useInvalidateMembers() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.teamMembers.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.dailyLogs.all }),
    ]);
}

export function useCreateTeamMember() {
  const invalidate = useInvalidateMembers();
  return useMutation({
    mutationFn: (request: TeamMemberRequest) => teamMembersApi.create(request),
    onSuccess: invalidate,
  });
}

export function useUpdateTeamMember(id: number) {
  const invalidate = useInvalidateMembers();
  return useMutation({
    mutationFn: (request: TeamMemberRequest) => teamMembersApi.update(id, request),
    onSuccess: invalidate,
  });
}

export function useDeleteTeamMember() {
  const invalidate = useInvalidateMembers();
  return useMutation({
    mutationFn: (id: number) => teamMembersApi.remove(id),
    onSuccess: invalidate,
  });
}
