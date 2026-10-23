"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clientsApi, MAX_CLIENT_PAGE_SIZE, type ClientFilters } from "@/lib/api/clients";
import type { ClientRequest } from "@/lib/api/types";
import { queryKeys } from "@/lib/query-keys";

/** One page of clients (default 10). */
export function useClients(filters: ClientFilters = {}) {
  return useQuery({
    queryKey: queryKeys.clients.list(filters),
    queryFn: () => clientsApi.list(filters),
    // Keep the current rows on screen while the next page loads.
    placeholderData: keepPreviousData,
  });
}

/** One page of soft-deleted clients. */
export function useArchivedClients(filters: Omit<ClientFilters, "active"> = {}) {
  return useQuery({
    queryKey: queryKeys.clients.archived(filters),
    queryFn: () => clientsApi.listArchived(filters),
    placeholderData: keepPreviousData,
  });
}

/** Every client at once, for dropdowns. */
export function useAllClients(filters: Omit<ClientFilters, "page" | "size"> = {}) {
  return useQuery({
    queryKey: queryKeys.clients.list({ ...filters, size: MAX_CLIENT_PAGE_SIZE }),
    queryFn: () => clientsApi.listAll(filters),
  });
}

export function useClient(id: number | undefined) {
  return useQuery({
    queryKey: queryKeys.clients.detail(id ?? 0),
    queryFn: () => clientsApi.get(id as number),
    enabled: id !== undefined,
  });
}

/** Client names appear on tasks, so refresh tasks and daily logs too. */
function useInvalidateClients() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.clients.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.dailyLogs.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all }),
    ]);
}

export function useCreateClient() {
  const invalidate = useInvalidateClients();
  return useMutation({
    mutationFn: (request: ClientRequest) => clientsApi.create(request),
    onSuccess: invalidate,
  });
}

export function useUpdateClient(id: number) {
  const invalidate = useInvalidateClients();
  return useMutation({
    mutationFn: (request: ClientRequest) => clientsApi.update(id, request),
    onSuccess: invalidate,
  });
}

export function useDeleteClient() {
  const invalidate = useInvalidateClients();
  return useMutation({
    mutationFn: (id: number) => clientsApi.remove(id),
    onSuccess: invalidate,
  });
}

export function useRestoreClient() {
  const invalidate = useInvalidateClients();
  return useMutation({
    mutationFn: (id: number) => clientsApi.restore(id),
    onSuccess: invalidate,
  });
}

export function useDeleteClientPermanently() {
  const invalidate = useInvalidateClients();
  return useMutation({
    mutationFn: (id: number) => clientsApi.removePermanently(id),
    onSuccess: invalidate,
  });
}
