import { apiFetch } from "./client";
import type { ClientRequest, ClientResponse } from "./types";

export interface ClientFilters {
  active?: boolean;
  q?: string;
}

export const clientsApi = {
  list: (filters: ClientFilters = {}) =>
    apiFetch<ClientResponse[]>("/clients", { query: { active: filters.active, q: filters.q } }),

  get: (id: number) => apiFetch<ClientResponse>(`/clients/${id}`),

  create: (request: ClientRequest) =>
    apiFetch<ClientResponse>("/clients", { method: "POST", body: request }),

  update: (id: number, request: ClientRequest) =>
    apiFetch<ClientResponse>(`/clients/${id}`, { method: "PUT", body: request }),

  remove: (id: number) => apiFetch<void>(`/clients/${id}`, { method: "DELETE" }),
};
