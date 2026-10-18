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
import {
  useCreateTeamMember,
  useTeamMember,
  useUpdateTeamMember,
} from "@/hooks/use-team-members";
import { ApiError, getErrorMessage } from "@/lib/api/client";
import type { TeamMemberResponse } from "@/lib/api/types";
import { applyServerErrors } from "@/lib/forms";
import {
  emptyTeamMemberForm,
  TEAM_MEMBER_FORM_FIELDS,
  teamMemberSchema,
  teamMemberToFormValues,
  toTeamMemberRequest,
  type TeamMemberFormValues,
} from "@/lib/schemas/team-member";

/**
 * Create form (no memberId) or edit form (memberId given).
 * For edit we load the member first, then render the form with its values.
 */
export function TeamMemberForm({ memberId }: { memberId?: number }) {
  const memberQuery = useTeamMember(memberId);

  if (memberId === undefined) {
    return <TeamMemberFormInner />;
  }
  if (memberQuery.isPending) {
    return (
      <Card className="space-y-4 p-6">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-10" />
        ))}
      </Card>
    );
  }
  if (memberQuery.isError) {
    if (memberQuery.error instanceof ApiError && memberQuery.error.isNotFound) {
      return (
        <EmptyState
          title="Team member not found"
          description="It may have been deleted."
          action={
            <Link href="/team-members" className={buttonClasses("secondary")}>
              Back to team
            </Link>
          }
        />
      );
    }
    return <ErrorState error={memberQuery.error} onRetry={() => memberQuery.refetch()} />;
  }
  return <TeamMemberFormInner member={memberQuery.data} />;
}

function TeamMemberFormInner({ member }: { member?: TeamMemberResponse }) {
  const router = useRouter();
  const createMember = useCreateTeamMember();
  const updateMember = useUpdateTeamMember(member?.id ?? 0);
  const isEdit = member !== undefined;

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<TeamMemberFormValues>({
    resolver: zodResolver(teamMemberSchema),
    defaultValues: member ? teamMemberToFormValues(member) : emptyTeamMemberForm,
  });

  async function onSubmit(values: TeamMemberFormValues) {
    const request = toTeamMemberRequest(values);
    try {
      if (isEdit) {
        await updateMember.mutateAsync(request);
        toast.success("Team member updated");
      } else {
        await createMember.mutateAsync(request);
        toast.success("Team member created");
      }
      router.push("/team-members");
    } catch (error) {
      // 400 -> show messages under the inputs; 409 duplicate email -> under "email"
      if (applyServerErrors(error, setError, TEAM_MEMBER_FORM_FIELDS)) return;
      if (error instanceof ApiError && error.isConflict) {
        setError("email", { type: "server", message: error.message });
        return;
      }
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5 p-6 sm:p-8">
        <FormField id="fullName" label="Full name" required error={errors.fullName?.message}>
          <Input
            id="fullName"
            autoComplete="name"
            aria-invalid={errors.fullName ? true : undefined}
            aria-describedby="fullName-error"
            {...register("fullName")}
          />
        </FormField>

        <FormField id="email" label="Email" required error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={errors.email ? true : undefined}
            aria-describedby="email-error"
            {...register("email")}
          />
        </FormField>

        <FormField
          id="designation"
          label="Designation"
          hint='For example "Flutter Developer"'
          error={errors.designation?.message}
        >
          <Input
            id="designation"
            aria-invalid={errors.designation ? true : undefined}
            aria-describedby="designation-error"
            {...register("designation")}
          />
        </FormField>

        <FormField
          id="displayOrder"
          label="Display order"
          hint="Lower numbers are shown first on the daily log."
          error={errors.displayOrder?.message}
        >
          <Input
            id="displayOrder"
            type="number"
            min={0}
            step={1}
            className="max-w-32"
            aria-invalid={errors.displayOrder ? true : undefined}
            aria-describedby="displayOrder-error"
            {...register("displayOrder", { valueAsNumber: true })}
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
              Inactive members are hidden from new daily logs but keep their history.
            </span>
          </span>
        </label>

        {errors.root?.server && (
          <p role="alert" className="text-sm text-red-600">
            {errors.root.server.message}
          </p>
        )}

        <div className="flex justify-end gap-2 border-t border-slate-200/70 pt-5">
          <Link href="/team-members" className={buttonClasses("secondary")}>
            Cancel
          </Link>
          <Button type="submit" loading={isSubmitting}>
            {isEdit ? "Save changes" : "Create team member"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
