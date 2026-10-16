"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button, buttonClasses } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
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
import {
  CLIENT_FORM_FIELDS,
  clientSchema,
  clientToFormValues,
  emptyClientForm,
  toClientRequest,
  type ClientFormValues,
} from "@/lib/schemas/client";

export function ClientForm({ clientId }: { clientId?: number }) {
  const clientQuery = useClient(clientId);

  if (clientId === undefined) {
    return <ClientFormInner />;
  }
  if (clientQuery.isPending) {
    return (
      <Card className="space-y-4 p-6">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-10" />
        ))}
      </Card>
    );
  }
  if (clientQuery.isError) {
    if (clientQuery.error instanceof ApiError && clientQuery.error.isNotFound) {
      return (
        <EmptyState
          title="Client not found"
          description="It may have been deleted."
          action={
            <Link href="/clients" className={buttonClasses("secondary")}>
              Back to clients
            </Link>
          }
        />
      );
    }
    return <ErrorState error={clientQuery.error} onRetry={() => clientQuery.refetch()} />;
  }
  return <ClientFormInner client={clientQuery.data} />;
}

function ClientFormInner({ client }: { client?: ClientResponse }) {
  const router = useRouter();
  const createClient = useCreateClient();
  const updateClient = useUpdateClient(client?.id ?? 0);
  const isEdit = client !== undefined;

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: client ? clientToFormValues(client) : emptyClientForm,
  });

  async function onSubmit(values: ClientFormValues) {
    const request = toClientRequest(values);
    try {
      if (isEdit) {
        await updateClient.mutateAsync(request);
        toast.success("Client updated");
      } else {
        await createClient.mutateAsync(request);
        toast.success("Client created");
      }
      router.push("/clients");
    } catch (error) {
      if (applyServerErrors(error, setError, CLIENT_FORM_FIELDS)) return;
      if (error instanceof ApiError && error.isConflict) {
        setError("name", { type: "server", message: error.message });
        return;
      }
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5 p-6">
        <FormField id="name" label="Name" required error={errors.name?.message}>
          <Input
            id="name"
            aria-invalid={errors.name ? true : undefined}
            aria-describedby="name-error"
            {...register("name")}
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

        <div className="flex items-start gap-3">
          <input
            id="active"
            type="checkbox"
            className="mt-0.5 size-4 rounded border-slate-300 accent-indigo-600"
            {...register("active")}
          />
          <div>
            <label htmlFor="active" className="text-sm font-medium text-slate-700">
              Active
            </label>
            <p className="text-xs text-slate-500">Inactive clients are hidden from the task form.</p>
          </div>
        </div>

        {errors.root?.server && (
          <p role="alert" className="text-sm text-red-600">
            {errors.root.server.message}
          </p>
        )}

        <div className="flex justify-end gap-2 border-t border-slate-200 pt-5">
          <Link href="/clients" className={buttonClasses("secondary")}>
            Cancel
          </Link>
          <Button type="submit" loading={isSubmitting}>
            {isEdit ? "Save changes" : "Create client"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
