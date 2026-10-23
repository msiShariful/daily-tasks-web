"use client";

import { useDeferredValue, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  useArchivedClients,
  useDeleteClientPermanently,
  useRestoreClient,
} from "@/hooks/use-clients";
import { getErrorMessage } from "@/lib/api/client";
import type { ClientResponse } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

/** Soft-deleted clients: restore them, or delete them for good. */
export function ArchivedClientTable() {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim());
  const [page, setPage] = useState(0);
  const { data, isPending, isPlaceholderData, isError, error, refetch } = useArchivedClients({
    search: deferredSearch || undefined,
    page,
    size: PAGE_SIZE,
  });
  const restore = useRestoreClient();
  const purge = useDeleteClientPermanently();
  const [toPurge, setToPurge] = useState<ClientResponse | null>(null);

  // Removing the only row on a later page would leave us past the end: step back.
  function stepBackIfEmpty() {
    if (page > 0 && data?.content.length === 1) setPage(page - 1);
  }

  function handleRestore(client: ClientResponse) {
    restore.mutate(client.id, {
      onSuccess: () => {
        toast.success(`${client.name} was restored`);
        stepBackIfEmpty();
      },
      onError: (err) => toast.error(getErrorMessage(err)),
    });
  }

  function confirmPurge() {
    if (!toPurge) return;
    purge.mutate(toPurge.id, {
      onSuccess: () => {
        toast.success(`${toPurge.name} was permanently deleted`);
        stepBackIfEmpty();
        setToPurge(null);
      },
      onError: (err) => {
        toast.error(getErrorMessage(err));
        setToPurge(null);
      },
    });
  }

  return (
    <div className="space-y-4">
      <div className="w-full max-w-sm">
        <label htmlFor="archived-client-search" className="sr-only">
          Search archived clients
        </label>
        <Input
          id="archived-client-search"
          type="search"
          placeholder="Search archived clients by name…"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(0);
          }}
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

      {data && data.totalElements === 0 && (
        <EmptyState
          title={deferredSearch ? "No archived clients match your search" : "Archive is empty"}
          description={
            deferredSearch ? "Try a different name." : "Deleted clients show up here."
          }
        />
      )}

      {data && data.totalElements > 0 && (
        <>
          <Card
            className={cn("overflow-x-auto transition-opacity", isPlaceholderData && "opacity-60")}
          >
            <table className="min-w-full divide-y divide-slate-200/70 text-sm">
              <thead className="bg-slate-50/80 text-left text-xs font-medium text-slate-500">
                <tr>
                  <th scope="col" className="px-5 py-3">Name</th>
                  <th scope="col" className="px-5 py-3">Ticket ID</th>
                  <th scope="col" className="px-5 py-3">Notes</th>
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
                    <td className="whitespace-nowrap px-5 py-3.5 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={restore.isPending}
                        onClick={() => handleRestore(client)}
                      >
                        Restore
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => setToPurge(client)}
                      >
                        Delete forever
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {data.totalPages > 1 && (
            <nav
              aria-label="Pagination"
              className="flex items-center justify-end gap-3 text-sm text-slate-600"
            >
              <span className="tabular-nums">
                {data.page * data.size + 1}–{data.page * data.size + data.content.length} of{" "}
                {data.totalElements}
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
            </nav>
          )}
        </>
      )}

      <ConfirmDialog
        open={toPurge !== null}
        title="Delete forever?"
        message={
          <>
            <strong>{toPurge?.name}</strong> will be permanently removed and cannot be restored.
            Clients still used by tasks cannot be deleted.
          </>
        }
        confirmLabel="Delete forever"
        destructive
        loading={purge.isPending}
        onConfirm={confirmPurge}
        onCancel={() => setToPurge(null)}
      />
    </div>
  );
}
