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
import { cn } from "@/lib/utils";
import { ClientForm } from "./ClientForm";

/** Which client the side panel is showing: a new one, or an existing one to edit. */
type Panel = { mode: "create" } | { mode: "edit"; client: ClientResponse };

const PAGE_SIZES = [10, 25, 50, 100] as const;

export function ClientTable() {
  const [search, setSearch] = useState("");
  // useDeferredValue: typing stays smooth; the query uses the "settled" value.
  const deferredSearch = useDeferredValue(search.trim());
  const [page, setPage] = useState(0);
  const [size, setSize] = useState<number>(PAGE_SIZES[0]);
  const { data, isPending, isPlaceholderData, isError, error, refetch } = useClients({
    search: deferredSearch || undefined,
    page,
    size,
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
        // Deleting the only row on a later page would leave us past the end: step back.
        if (page > 0 && data?.content.length === 1) setPage(page - 1);
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

  const showPager = data !== undefined && (data.totalPages > 1 || size !== PAGE_SIZES[0]);
  const rangeStart = data ? data.page * data.size + 1 : 0;
  const rangeEnd = data ? rangeStart + data.content.length - 1 : 0;

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
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(0);
            }}
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

      {data && data.totalElements === 0 && (
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

      {data && data.totalElements > 0 && (
        <>
          <Card
            className={cn(
              "overflow-x-auto transition-opacity",
              isPlaceholderData && "opacity-60",
            )}
          >
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
                {data.content.map((client) => (
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

          {showPager && (
            <nav
              aria-label="Pagination"
              className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600"
            >
              <label htmlFor="client-page-size" className="flex items-center gap-2">
                Rows per page
                <select
                  id="client-page-size"
                  value={size}
                  onChange={(event) => {
                    setSize(Number(event.target.value));
                    setPage(0);
                  }}
                  className="h-8 rounded-lg border-0 bg-white py-0 pl-2.5 pr-7 text-xs font-medium text-slate-800 ring-1 ring-inset ring-slate-200 transition-[box-shadow] hover:ring-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:shadow-[0_0_0_4px_rgb(99_102_241/0.12)]"
                >
                  {PAGE_SIZES.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex items-center gap-3">
                <span className="tabular-nums">
                  {rangeStart}–{rangeEnd} of {data.totalElements}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page <= 0}
                  onClick={() => setPage(page - 1)}
                >
                  ← Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page + 1 >= data.totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next →
                </Button>
              </div>
            </nav>
          )}
        </>
      )}

      <Modal
        open={panel !== null}
        onClose={() => setPanel(null)}
        placement="right"
        size="md"
        title={panel?.mode === "edit" ? "Edit client" : "New client"}
        description={panel?.mode === "edit" ? panel.client.name : "Who the work is for."}
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
