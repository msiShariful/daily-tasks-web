"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";
import { Textarea } from "@/components/ui/Textarea";
import { useAllClients, useCreateClient } from "@/hooks/use-clients";
import { useTaskStatuses } from "@/hooks/use-task-statuses";
import { useTeamMembers } from "@/hooks/use-team-members";
import { useCreateTask, useUpdateTask } from "@/hooks/use-tasks";
import { ApiError, getErrorMessage } from "@/lib/api/client";
import { clientsApi } from "@/lib/api/clients";
import { tasksApi } from "@/lib/api/tasks";
import type { ClientSummary, IsoDate, TaskResponse, TeamMemberSummary } from "@/lib/api/types";
import { applyServerErrors } from "@/lib/forms";
import { parseQuickEntry, sameClientName } from "@/lib/quick-entry";
import {
  emptyTaskForm,
  TASK_FORM_FIELDS,
  taskSchema,
  taskToFormValues,
  toTaskRequest,
  type TaskFormValues,
} from "@/lib/schemas/task";
import { FALLBACK_TASK_STATUSES } from "@/lib/task-status";
import { TaskLinksField } from "./TaskLinksField";

interface TaskFormDialogProps {
  open: boolean;
  onClose: () => void;
  /** Day the task is created on (create mode). */
  workDate: IsoDate;
  /** Present = edit mode. */
  task?: TaskResponse;
  /** Pre-selected member when clicking "+ Add task" in a member's section. */
  defaultMemberId?: number;
}

export function TaskFormDialog({ open, onClose, workDate, task, defaultMemberId }: TaskFormDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title={task ? "Edit task" : "New task"} size="lg">
      <TaskForm
        workDate={workDate}
        task={task}
        defaultMemberId={defaultMemberId}
        onDone={onClose}
      />
    </Modal>
  );
}

interface TaskFormProps {
  workDate: IsoDate;
  task?: TaskResponse;
  defaultMemberId?: number;
  onDone: () => void;
}

/**
 * Loads the member and client lists first. A <select> only picks its default value
 * when it is created, so the form must not render before its <option>s exist.
 */
function TaskForm(props: TaskFormProps) {
  const membersQuery = useTeamMembers({ active: true });
  const clientsQuery = useAllClients({ active: true });

  if (membersQuery.isPending || clientsQuery.isPending) {
    return (
      <div className="flex justify-center py-10">
        <Spinner className="size-6 text-indigo-600" label="Loading form" />
      </div>
    );
  }
  if (membersQuery.isError || clientsQuery.isError) {
    return (
      <ErrorState
        error={membersQuery.error ?? clientsQuery.error}
        onRetry={() => {
          void membersQuery.refetch();
          void clientsQuery.refetch();
        }}
      />
    );
  }
  return <TaskFormInner {...props} members={membersQuery.data} clients={clientsQuery.data} />;
}

interface TaskFormInnerProps extends TaskFormProps {
  members: TeamMemberSummary[];
  clients: ClientSummary[];
}

/** Sentinel <option> value standing for "a client that does not exist yet". */
const NEW_CLIENT = "__new__";

function TaskFormInner({ workDate, task, defaultMemberId, onDone, members, clients }: TaskFormInnerProps) {
  const isEdit = task !== undefined;
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const { data: statuses = FALLBACK_TASK_STATUSES } = useTaskStatuses();

  // The version we loaded. The server rejects the save (409) if someone changed the task since.
  const [version, setVersion] = useState(task?.version);
  // A client name typed into quick entry that no existing client matches yet.
  // It is only created on submit, so abandoning the form leaves no stray client.
  const [newClientName, setNewClientName] = useState("");
  // The pasted numeric prefix, reused as the new client's ticketId (null if non-numeric).
  const [newClientTicketId, setNewClientTicketId] = useState<number | null>(null);
  const createClient = useCreateClient();
  const [conflict, setConflict] = useState(false);
  const [reloading, setReloading] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    setError,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: task ? taskToFormValues(task) : emptyTaskForm(workDate, defaultMemberId),
  });

  // An edited task may belong to a now-inactive member/client: keep it selectable.
  const memberOptions =
    task && !members.some((m) => m.id === task.teamMember.id)
      ? [...members, { id: task.teamMember.id, fullName: `${task.teamMember.fullName} (inactive)` }]
      : members;
  const clientOptions =
    task?.client && !clients.some((c) => c.id === task.client?.id)
      ? [
          ...clients,
          { id: task.client.id, name: `${task.client.name} (inactive)`, ticketId: task.client.ticketId },
        ]
      : clients;

  // The staged <option> only exists after newClientName renders, so select it
  // here rather than in the handler - a value with no matching option is dropped.
  useEffect(() => {
    if (newClientName !== "") setValue("clientId", NEW_CLIENT, { shouldDirty: true });
  }, [newClientName, setValue]);

  /** Paste "52640 - Yazan Al Masri": fill Task ID, and pick or stage the client. */
  function applyQuickEntry(raw: string) {
    const { taskCode, clientName } = parseQuickEntry(raw);
    if (taskCode) setValue("taskCode", taskCode, { shouldDirty: true });

    if (!clientName) {
      setNewClientName("");
      setNewClientTicketId(null);
      return;
    }
    const existing = clients.find((c) => sameClientName(c.name, clientName));
    if (existing) {
      setNewClientName("");
      setNewClientTicketId(null);
      setValue("clientId", String(existing.id), { shouldDirty: true });
    } else {
      setNewClientName(clientName); // the effect above selects it once rendered
      setNewClientTicketId(/^\d+$/.test(taskCode) ? Number(taskCode) : null);
    }
  }

  /**
   * Turn the staged client name into a real id. Looks the name up first so an
   * inactive client, or one added since the dialog opened, is reused instead of
   * duplicated; a 409 from a concurrent create is resolved the same way.
   */
  async function resolveClientId(clientId: string): Promise<string> {
    if (clientId !== NEW_CLIENT) return clientId;
    const name = newClientName.trim();
    if (!name) return "";

    const matches = await clientsApi.listAll({ search: name });
    const found = matches.find((c) => sameClientName(c.name, name));
    if (found) return String(found.id);

    if (newClientTicketId === null) {
      throw new Error(
        `"${name}" is a new client, but its ticket id must be a number. ` +
          "Paste it as \"<number> - name\", or add this client from the Clients page first.",
      );
    }

    try {
      const created = await createClient.mutateAsync({
        name,
        ticketId: newClientTicketId,
        notes: null,
        active: true,
      });
      return String(created.id);
    } catch (error) {
      if (error instanceof ApiError && error.isConflict) {
        const retry = await clientsApi.listAll({ search: name });
        const raced = retry.find((c) => sameClientName(c.name, name));
        if (raced) return String(raced.id);
      }
      throw error;
    }
  }

  async function onSubmit(rawValues: TaskFormValues) {
    setConflict(false);
    try {
      const values = { ...rawValues, clientId: await resolveClientId(rawValues.clientId) };
      if (isEdit) {
        await updateTask.mutateAsync({ id: task.id, request: toTaskRequest(values, version) });
        toast.success("Task saved");
      } else {
        await createTask.mutateAsync(toTaskRequest(values));
        toast.success("Task created");
      }
      onDone();
    } catch (error) {
      if (applyServerErrors(error, setError, TASK_FORM_FIELDS)) return;
      if (error instanceof ApiError && error.isConflict) {
        setConflict(true);
        return;
      }
      toast.error(getErrorMessage(error));
    }
  }

  async function reloadLatest() {
    if (!task) return;
    setReloading(true);
    try {
      const latest = await tasksApi.get(task.id);
      reset(taskToFormValues(latest));
      setVersion(latest.version);
      setConflict(false);
      toast.info("Loaded the latest version. Re-apply your changes and save again.");
    } catch (error) {
      toast.error(getErrorMessage(error));
      if (error instanceof ApiError && error.isNotFound) onDone();
    } finally {
      setReloading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {conflict && (
        <div role="alert" className="rounded-lg border border-amber-200 bg-amber-50 p-3.5 text-sm">
          <p className="font-medium text-amber-900">Someone else changed this task.</p>
          <p className="mt-0.5 text-amber-800">
            Your copy is out of date (maybe its status was changed). Load the latest version, then
            make your edit again.
          </p>
          <Button
            variant="secondary"
            size="sm"
            className="mt-2"
            loading={reloading}
            onClick={reloadLatest}
          >
            Load latest version
          </Button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          id="quickEntry"
          label="Quick entry"
          hint='Paste "52640 - Yazan Al Masri" to fill Task ID and Client at once.'
          className="sm:col-span-2"
        >
          <Input
            id="quickEntry"
            placeholder="52640 - Yazan Al Masri"
            autoComplete="off"
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

        <FormField id="teamMemberId" label="Team member" required error={errors.teamMemberId?.message}>
          <Select
            id="teamMemberId"
            aria-invalid={errors.teamMemberId ? true : undefined}
            {...register("teamMemberId")}
          >
            <option value="">Choose…</option>
            {memberOptions.map((member) => (
              <option key={member.id} value={String(member.id)}>
                {member.fullName}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField id="workDate" label="Date" required error={errors.workDate?.message}>
          <Input
            id="workDate"
            type="date"
            aria-invalid={errors.workDate ? true : undefined}
            {...register("workDate")}
          />
        </FormField>

        <FormField
          id="clientId"
          label="Client"
          hint={
            newClientName !== ""
              ? `"${newClientName}" will be added to your clients when you save.`
              : "Leave empty for internal work."
          }
          error={errors.clientId?.message}
        >
          <Select id="clientId" {...register("clientId")}>
            <option value="">— Internal (no client) —</option>
            {newClientName !== "" && <option value={NEW_CLIENT}>{newClientName} — new client</option>}
            {clientOptions.map((client) => (
              <option key={client.id} value={String(client.id)}>
                {client.name}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField id="taskCode" label="Task ID" hint='e.g. "6AM-1234"' error={errors.taskCode?.message}>
          <Input
            id="taskCode"
            className="font-mono"
            aria-invalid={errors.taskCode ? true : undefined}
            {...register("taskCode")}
          />
        </FormField>
      </div>

      <FormField id="title" label="Short description" required error={errors.title?.message}>
        <Input
          id="title"
          aria-invalid={errors.title ? true : undefined}
          {...register("title")}
        />
      </FormField>

      <FormField id="details" label="Details" error={errors.details?.message}>
        <Textarea id="details" rows={3} {...register("details")} />
      </FormField>

      <FormField id="status" label="Status" required error={errors.status?.message} className="max-w-60">
        <Select id="status" {...register("status")}>
          {statuses.map((status) => (
            <option key={status.code} value={status.code}>
              {status.label}
            </option>
          ))}
        </Select>
      </FormField>

      <TaskLinksField control={control} register={register} errors={errors} />

      {errors.root?.server && (
        <p role="alert" className="text-sm text-red-600">
          {errors.root.server.message}
        </p>
      )}

      <div className="flex justify-end gap-2 border-t border-slate-200/70 pt-5">
        <Button variant="secondary" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {isEdit ? "Save changes" : "Create task"}
        </Button>
      </div>
    </form>
  );
}
