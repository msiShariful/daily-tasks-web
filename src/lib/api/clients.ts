import { apiFetch } from "./client";
import type { ClientRequest, ClientResponse, PageResponse } from "./types";

export interface ClientFilters {
  active?: boolean;
  search?: string;
  page?: number;
  size?: number;
}

/** The API caps a page at 100 - enough to fetch every client in one request. */
export const MAX_CLIENT_PAGE_SIZE = 100;

function list(filters: ClientFilters = {}) {
  return apiFetch<PageResponse<ClientResponse>>("/clients", { query: { ...filters } });
}

function listArchived(filters: Omit<ClientFilters, "active"> = {}) {
  return apiFetch<PageResponse<ClientResponse>>("/clients/archived", { query: { ...filters } });
}

export const clientsApi = {
  list,

  /** Soft-deleted clients. */
  listArchived,

  restore: (id: number) => apiFetch<ClientResponse>(`/clients/${id}/restore`, { method: "POST" }),

  /** Permanent. Only works on archived clients that no task uses. */
  removePermanently: (id: number) =>
    apiFetch<void>(`/clients/${id}/permanent`, { method: "DELETE" }),

  /** Every matching client in one go, for dropdowns and name lookups. */
  listAll: (filters: Omit<ClientFilters, "page" | "size"> = {}) =>
    list({ ...filters, size: MAX_CLIENT_PAGE_SIZE }).then((page) => page.content),

  get: (id: number) => apiFetch<ClientResponse>(`/clients/${id}`),

  create: (request: ClientRequest) =>
    apiFetch<ClientResponse>("/clients", { method: "POST", body: request }),

  update: (id: number, request: ClientRequest) =>
    apiFetch<ClientResponse>(`/clients/${id}`, { method: "PUT", body: request }),

  remove: (id: number) => apiFetch<void>(`/clients/${id}`, { method: "DELETE" }),
};
