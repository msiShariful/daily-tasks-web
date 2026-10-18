"use client";

import { useDeferredValue, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { useClients, useDeleteClient } from "@/hooks/use-clients";
import { ApiError, getErrorMessage } from "@/lib/api/client";
import type { ClientResponse } from "@/lib/api/types";
import { ClientForm } from "./ClientForm";

/** Which client the side panel is showing: a new one, or an existing one to edit. */
type Panel = { mode: "create" } | { mode: "edit"; client: ClientResponse };

export function ClientTable() {
  const [search, setSearch] = useState("");
  // useDeferredValue: typing stays smooth; the query uses the "settled" value.
  const deferredSearch = useDeferredValue(search.trim());
  const { data: clients, isPending, isError, error, refetch } = useClients({
    q: deferredSearch || undefined,
  });
  const deleteClient = useDeleteClient();
  const [toDelete, setToDelete] = useState<ClientResponse | null>(null);
  const [panel, setPanel] = useState<Panel | null>(null);

  function confirmDelete() {
    if (!toDelete) return;
    deleteClient.mutate(toDelete.id, {
      onSuccess: () => {
        toast.success(`${toDelete.name} was deleted`);
        setToDelete(null);
      },
      onError: (err) => {
        const message =
          err instanceof ApiError && err.isConflict
            ? `${err.message} Edit the client and untick "Active" instead.`
            : getErrorMessage(err);
        toast.error(message);
        setToDelete(null);
      },
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="w-full max-w-sm">
          <label htmlFor="client-search" className="sr-only">
            Search clients
          </label>
          <Input
            id="client-search"
            type="search"
            placeholder="Search clients by name…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <Button onClick={() => setPanel({ mode: "create" })}>Add client</Button>
      </div>

      {isPending && (
        <Card className="space-y-3 p-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-8" />
          ))}
        </Card>
      )}

      {isError && <ErrorState error={error} onRetry={() => refetch()} />}

      {clients && clients.length === 0 && (
        <EmptyState
          title={deferredSearch ? "No clients match your search" : "No clients yet"}
          description={deferredSearch ? "Try a different name." : "Add the clients you work for."}
          action={
            !deferredSearch && (
              <Button onClick={() => setPanel({ mode: "create" })}>Add client</Button>
            )
          }
        />
      )}

      {clients && clients.length > 0 && (
        <Card className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200/70 text-sm">
            <thead className="bg-slate-50/80 text-left text-xs font-medium text-slate-500">
              <tr>
                <th scope="col" className="px-5 py-3">Name</th>
                <th scope="col" className="px-5 py-3">Ticket ID</th>
                <th scope="col" className="px-5 py-3">Notes</th>
                <th scope="col" className="px-5 py-3">Status</th>
                <th scope="col" className="px-5 py-3 text-right">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clients.map((client) => (
                <tr key={client.id} className="transition-colors hover:bg-slate-50/60">
                  <td className="px-5 py-3.5 font-medium text-slate-900">{client.name}</td>
                  <td className="px-5 py-3.5 tabular-nums text-slate-600">{client.ticketId}</td>
                  <td className="max-w-md truncate px-5 py-3.5 text-slate-600">
                    {client.notes ?? "—"}
                  </td>
                  <td className="px-5 py-3.5">
                    {client.active ? <Badge tone="green">Active</Badge> : <Badge>Inactive</Badge>}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPanel({ mode: "edit", client })}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => setToDelete(client)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Modal
        open={panel !== null}
        onClose={() => setPanel(null)}
        placement="right"
        size="md"
        title={panel?.mode === "edit" ? "Edit client" : "New client"}
        description={
          panel?.mode === "edit" ? panel.client.name : "Who the work is for."
        }
      >
        <ClientForm
          clientId={panel?.mode === "edit" ? panel.client.id : undefined}
          onDone={() => setPanel(null)}
        />
      </Modal>

      <ConfirmDialog
        open={toDelete !== null}
        title="Delete client?"
        message={
          <>
            <strong>{toDelete?.name}</strong> will be removed. Clients used by tasks cannot be
            deleted - mark them inactive instead.
          </>
        }
        confirmLabel="Delete"
        destructive
        loading={deleteClient.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
