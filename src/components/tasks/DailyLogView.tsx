"use client";

import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { buttonClasses } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { useDailyLog } from "@/hooks/use-daily-log";
import type { IsoDate } from "@/lib/api/types";
import { formatDayLong, todayIso } from "@/lib/dates";
import { DailyLogSkeleton } from "./DailyLogSkeleton";
import { DayNavigator } from "./DayNavigator";
import { MemberSection } from "./MemberSection";

/** The main screen: one day ("tab") with a section per team member. */
export function DailyLogView({ date }: { date: IsoDate }) {
  const { data, isPending, isError, error, refetch, isFetching } = useDailyLog(date);

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
            <MemberSection key={section.member.id} section={section} />
          ))}
        </div>
      )}
    </div>
  );
}
