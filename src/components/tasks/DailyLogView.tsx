"use client";

import Link from "next/link";
import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button, buttonClasses } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { useDailyLog } from "@/hooks/use-daily-log";
import type { IsoDate, TaskResponse } from "@/lib/api/types";
import { formatDayLong, todayIso } from "@/lib/dates";
import { CarryOverButton } from "./CarryOverButton";
import { DailyLogSkeleton } from "./DailyLogSkeleton";
import { DayNavigator } from "./DayNavigator";
import { MemberSection } from "./MemberSection";
import { TaskFormDialog } from "./TaskFormDialog";

/** Which task dialog is open: none, "new task" (maybe for a member), or "edit task". */
type DialogState =
  | { mode: "create"; memberId?: number }
  | { mode: "edit"; task: TaskResponse }
  | null;

/** The main screen: one day ("tab") with a section per team member. */
export function DailyLogView({ date }: { date: IsoDate }) {
  const { data, isPending, isError, error, refetch, isFetching } = useDailyLog(date);
  const [dialog, setDialog] = useState<DialogState>(null);

  const total = data?.members.reduce((sum, section) => sum + section.total, 0) ?? 0;
  const done = data?.members.reduce((sum, section) => sum + section.done, 0) ?? 0;
  const isToday = date === todayIso();

  return (
    <div>
      <PageHeader
        title={
          <span className="flex flex-wrap items-center gap-2">
            {formatDayLong(date)}
            {isToday && <Badge tone="indigo">Today</Badge>}
          </span>
        }
        description={
          data ? (
            <span aria-live="polite">
              {total} task{total === 1 ? "" : "s"} · {done} done
              {isFetching && !isPending ? " · refreshing…" : ""}
            </span>
          ) : undefined
        }
        actions={
          <>
            <CarryOverButton date={date} />
            <Button onClick={() => setDialog({ mode: "create" })}>+ New task</Button>
          </>
        }
      />

      <div className="mb-6">
        <DayNavigator date={date} />
      </div>

      {isPending && <DailyLogSkeleton />}

      {isError && <ErrorState error={error} onRetry={() => refetch()} />}

      {data && data.members.length === 0 && (
        <EmptyState
          title="No active team members"
          description="Add your team first - each member gets a section on every day."
          action={
            <Link href="/team-members/new" className={buttonClasses()}>
              Add team member
            </Link>
          }
        />
      )}

      {data && data.members.length > 0 && (
        <div className="space-y-4">
          {data.members.map((section) => (
            <MemberSection
              key={section.member.id}
              date={date}
              section={section}
              onAddTask={(memberId) => setDialog({ mode: "create", memberId })}
              onEditTask={(task) => setDialog({ mode: "edit", task })}
            />
          ))}
        </div>
      )}

      <TaskFormDialog
        open={dialog !== null}
        onClose={() => setDialog(null)}
        workDate={date}
        task={dialog?.mode === "edit" ? dialog.task : undefined}
        defaultMemberId={dialog?.mode === "create" ? dialog.memberId : undefined}
      />
    </div>
  );
}
