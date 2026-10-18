"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/Badge";
import { Button, buttonClasses } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useDeleteTeamMember, useTeamMembers } from "@/hooks/use-team-members";
import { ApiError, getErrorMessage } from "@/lib/api/client";
import type { TeamMemberResponse } from "@/lib/api/types";

export function TeamMemberTable() {
  const { data: members, isPending, isError, error, refetch } = useTeamMembers();
  const deleteMember = useDeleteTeamMember();
  const [toDelete, setToDelete] = useState<TeamMemberResponse | null>(null);

  function confirmDelete() {
    if (!toDelete) return;
    deleteMember.mutate(toDelete.id, {
      onSuccess: () => {
        toast.success(`${toDelete.fullName} was deleted`);
        setToDelete(null);
      },
      onError: (err) => {
        // 409 = the member already has tasks; the API tells us to deactivate instead.
        const message =
          err instanceof ApiError && err.isConflict
            ? `${err.message} Edit the member and untick "Active" instead.`
            : getErrorMessage(err);
        toast.error(message);
        setToDelete(null);
      },
    });
  }

  if (isPending) {
    return (
      <Card className="space-y-3 p-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-8" />
        ))}
      </Card>
    );
  }

  if (isError) {
    return <ErrorState error={error} onRetry={() => refetch()} />;
  }

  if (members.length === 0) {
    return (
      <EmptyState
        title="No team members yet"
        description="Add the people whose tasks you track every day."
        action={
          <Link href="/team-members/new" className={buttonClasses()}>
            Add team member
          </Link>
        }
      />
    );
  }

  return (
    <>
      <Card className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200/70 text-sm">
          <thead className="bg-slate-50/80 text-left text-xs font-medium text-slate-500">
            <tr>
              <th scope="col" className="px-5 py-3">Order</th>
              <th scope="col" className="px-5 py-3">Name</th>
              <th scope="col" className="px-5 py-3">Email</th>
              <th scope="col" className="px-5 py-3">Designation</th>
              <th scope="col" className="px-5 py-3">Status</th>
              <th scope="col" className="px-5 py-3 text-right">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {members.map((member) => (
              <tr key={member.id} className="transition-colors hover:bg-slate-50/60">
                <td className="px-5 py-3.5 tabular-nums text-slate-500">{member.displayOrder}</td>
                <td className="px-5 py-3.5 font-medium text-slate-900">{member.fullName}</td>
                <td className="px-5 py-3.5 text-slate-600">{member.email}</td>
                <td className="px-5 py-3.5 text-slate-600">{member.designation ?? "—"}</td>
                <td className="px-5 py-3.5">
                  {member.active ? <Badge tone="green">Active</Badge> : <Badge>Inactive</Badge>}
                </td>
                <td className="whitespace-nowrap px-5 py-3.5 text-right">
                  <Link
                    href={`/team-members/${member.id}/edit`}
                    className={buttonClasses("ghost", "sm")}
                  >
                    Edit
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => setToDelete(member)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <ConfirmDialog
        open={toDelete !== null}
        title="Delete team member?"
        message={
          <>
            <strong>{toDelete?.fullName}</strong> will be removed. Members who already have tasks
            cannot be deleted - mark them inactive instead.
          </>
        }
        confirmLabel="Delete"
        destructive
        loading={deleteMember.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}
