"use client";

import Link from "next/link";
import { useDeferredValue, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/Badge";
import { Button, buttonClasses } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { useClients, useDeleteClient } from "@/hooks/use-clients";
import { ApiError, getErrorMessage } from "@/lib/api/client";
import type { ClientResponse } from "@/lib/api/types";

export function ClientTable() {
  const [search, setSearch] = useState("");
  // useDeferredValue: typing stays smooth; the query uses the "settled" value.
  const deferredSearch = useDeferredValue(search.trim());
  const { data: clients, isPending, isError, error, refetch } = useClients({
    q: deferredSearch || undefined,
  });
  const deleteClient = useDeleteClient();
  const [toDelete, setToDelete] = useState<ClientResponse | null>(null);

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
      <div className="max-w-sm">
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
              <Link href="/clients/new" className={buttonClasses()}>
                Add client
              </Link>
            )
          }
        />
      )}

      {clients && clients.length > 0 && (
        <Card className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th scope="col" className="px-4 py-3">Name</th>
                <th scope="col" className="px-4 py-3">Notes</th>
                <th scope="col" className="px-4 py-3">Status</th>
                <th scope="col" className="px-4 py-3 text-right">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{client.name}</td>
                  <td className="max-w-md truncate px-4 py-3 text-slate-600">
                    {client.notes ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    {client.active ? <Badge tone="green">Active</Badge> : <Badge>Inactive</Badge>}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <Link href={`/clients/${client.id}/edit`} className={buttonClasses("ghost", "sm")}>
                      Edit
                    </Link>
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
