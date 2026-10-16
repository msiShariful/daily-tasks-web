"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
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
import { useClients } from "@/hooks/use-clients";
import { useTaskStatuses } from "@/hooks/use-task-statuses";
import { useTeamMembers } from "@/hooks/use-team-members";
import { useCreateTask, useUpdateTask } from "@/hooks/use-tasks";
import { ApiError, getErrorMessage } from "@/lib/api/client";
import { tasksApi } from "@/lib/api/tasks";
import type { ClientSummary, IsoDate, TaskResponse, TeamMemberSummary } from "@/lib/api/types";
import { applyServerErrors } from "@/lib/forms";
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
  const clientsQuery = useClients({ active: true });

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

function TaskFormInner({ workDate, task, defaultMemberId, onDone, members, clients }: TaskFormInnerProps) {
  const isEdit = task !== undefined;
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const { data: statuses = FALLBACK_TASK_STATUSES } = useTaskStatuses();

  // The version we loaded. The server rejects the save (409) if someone changed the task since.
  const [version, setVersion] = useState(task?.version);
  const [conflict, setConflict] = useState(false);
  const [reloading, setReloading] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    setError,
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
      ? [...clients, { id: task.client.id, name: `${task.client.name} (inactive)` }]
      : clients;

  async function onSubmit(values: TaskFormValues) {
    setConflict(false);
    try {
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
        <div role="alert" className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm">
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

        <FormField id="clientId" label="Client" hint="Leave empty for internal work." error={errors.clientId?.message}>
          <Select id="clientId" {...register("clientId")}>
            <option value="">— Internal (no client) —</option>
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

      <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
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
