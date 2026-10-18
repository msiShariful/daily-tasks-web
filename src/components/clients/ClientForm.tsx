"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { Textarea } from "@/components/ui/Textarea";
import { useClient, useCreateClient, useUpdateClient } from "@/hooks/use-clients";
import { ApiError, getErrorMessage } from "@/lib/api/client";
import type { ClientResponse } from "@/lib/api/types";
import { applyServerErrors } from "@/lib/forms";
import { parseQuickEntry } from "@/lib/quick-entry";
import {
  CLIENT_FORM_FIELDS,
  clientSchema,
  clientToFormValues,
  emptyClientForm,
  toClientRequest,
  type ClientFormValues,
} from "@/lib/schemas/client";

interface ClientFormProps {
  /** Omit to create a client; pass an id to edit one. */
  clientId?: number;
  /** Called after a successful save or when the user cancels. */
  onDone: () => void;
}

/** Rendered inside the client panel: loads the client for edit, then shows the form. */
export function ClientForm({ clientId, onDone }: ClientFormProps) {
  const clientQuery = useClient(clientId);

  if (clientId === undefined) {
    return <ClientFormInner onDone={onDone} />;
  }
  if (clientQuery.isPending) {
    return (
      <div className="space-y-5">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-10" />
        ))}
      </div>
    );
  }
  if (clientQuery.isError) {
    if (clientQuery.error instanceof ApiError && clientQuery.error.isNotFound) {
      return (
        <EmptyState
          title="Client not found"
          description="It may have been deleted."
          action={
            <Button variant="secondary" onClick={onDone}>
              Close
            </Button>
          }
        />
      );
    }
    return <ErrorState error={clientQuery.error} onRetry={() => clientQuery.refetch()} />;
  }
  return <ClientFormInner client={clientQuery.data} onDone={onDone} />;
}

function ClientFormInner({ client, onDone }: { client?: ClientResponse; onDone: () => void }) {
  const createClient = useCreateClient();
  const updateClient = useUpdateClient(client?.id ?? 0);
  const isEdit = client !== undefined;

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: client ? clientToFormValues(client) : emptyClientForm,
  });

  /** Paste "52640 - Yazan Al Masri": fill Ticket ID and Name in one go. */
  function applyQuickEntry(raw: string) {
    const { taskCode, clientName } = parseQuickEntry(raw);
    if (/^\d+$/.test(taskCode)) setValue("ticketId", Number(taskCode), { shouldDirty: true });
    if (clientName) setValue("name", clientName, { shouldDirty: true });
  }

  async function onSubmit(values: ClientFormValues) {
    const request = toClientRequest(values);
    try {
      if (isEdit) {
        await updateClient.mutateAsync(request);
        toast.success("Client saved");
      } else {
        await createClient.mutateAsync(request);
        toast.success("Client created");
      }
      onDone();
    } catch (error) {
      if (applyServerErrors(error, setError, CLIENT_FORM_FIELDS)) return;
      if (error instanceof ApiError && error.isConflict) {
        setError("ticketId", { type: "server", message: error.message });
        return;
      }
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex h-full flex-col">
      <div className="flex-1 space-y-5">
        {!isEdit && (
          <FormField
            id="quickEntry"
            label="Quick entry"
            hint='Paste "52640 - Yazan Al Masri" to fill Ticket ID and Name at once.'
          >
            <Input
              id="quickEntry"
              placeholder="52640 - Yazan Al Masri"
              autoComplete="off"
              autoFocus
              onChange={(event) => applyQuickEntry(event.target.value)}
              onKeyDown={(event) => {
                // Enter here should split the value, not submit a half-filled form.
                if (event.key === "Enter") {
                  event.preventDefault();
                  applyQuickEntry(event.currentTarget.value);
                }
              }}
            />
          </FormField>
        )}

        <FormField id="name" label="Name" required error={errors.name?.message}>
          <Input
            id="name"
            autoFocus={isEdit}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby="name-error"
            {...register("name")}
          />
        </FormField>

        <FormField
          id="ticketId"
          label="Ticket ID"
          required
          hint="The client's ticket number, e.g. 52640. Each client has its own."
          error={errors.ticketId?.message}
        >
          <Input
            id="ticketId"
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            className="max-w-40 tabular-nums"
            aria-invalid={errors.ticketId ? true : undefined}
            aria-describedby="ticketId-error"
            {...register("ticketId", { valueAsNumber: true })}
          />
        </FormField>

        <FormField id="notes" label="Notes" error={errors.notes?.message}>
          <Textarea
            id="notes"
            rows={4}
            aria-invalid={errors.notes ? true : undefined}
            aria-describedby="notes-error"
            {...register("notes")}
          />
        </FormField>

        <label
          htmlFor="active"
          className="flex cursor-pointer items-start gap-3 rounded-lg px-3.5 py-3 ring-1 ring-slate-200/70 transition-colors hover:bg-slate-50/80"
        >
          <input
            id="active"
            type="checkbox"
            className="mt-0.5 size-4 rounded border-slate-300 accent-indigo-600"
            {...register("active")}
          />
          <span>
            <span className="block text-sm font-medium text-slate-800">Active</span>
            <span className="block text-xs text-slate-500">
              Inactive clients are hidden from the task form.
            </span>
          </span>
        </label>

        {errors.root?.server && (
          <p role="alert" className="text-sm text-red-600">
            {errors.root.server.message}
          </p>
        )}
      </div>

      <div className="mt-8 flex justify-end gap-2 border-t border-slate-200/70 pt-5">
        <Button variant="secondary" onClick={onDone} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {isEdit ? "Save changes" : "Create client"}
        </Button>
      </div>
    </form>
  );
}
