"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/Skeleton";
import { useDailyLogDays } from "@/hooks/use-daily-log";
import type { DailyLogDaySummary } from "@/lib/api/types";
import { formatDayShort, todayIso } from "@/lib/dates";
import { cn } from "@/lib/utils";

/**
 * The list of days on the left - the Google Doc "tabs".
 * Shows today first (even if empty), then every day that has tasks.
 */
export function Sidebar() {
  // useParams() reads the dynamic segment in a Client Component: /daily/[date] -> { date }
  const params = useParams<{ date?: string }>();
  const activeDate = params.date;
  const { data, isPending, isError } = useDailyLogDays();

  const today = todayIso();
  const days: DailyLogDaySummary[] = data ?? [];
  const hasToday = days.some((day) => day.date === today);
  const items = hasToday ? days : [{ date: today, taskCount: 0, doneCount: 0 }, ...days];

  return (
    <aside
      aria-label="Days"
      className="hidden w-56 shrink-0 border-r border-slate-200/70 px-3 py-6 md:sticky md:top-14 md:block md:h-[calc(100vh-3.5rem)] md:overflow-y-auto"
    >
      <h2 className="px-2.5 text-xs font-medium text-slate-500">Days</h2>

      {isPending && (
        <div className="mt-3 space-y-2 px-2">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-7" />
          ))}
        </div>
      )}

      {isError && <p className="mt-3 px-2 text-xs text-red-600">Could not load days.</p>}

      {!isPending && (
        <ul className="mt-2 space-y-1">
          {items.map((day) => {
            const active = day.date === activeDate;
            const allDone = day.taskCount > 0 && day.doneCount === day.taskCount;
            return (
              <li key={day.date}>
                <Link
                  href={`/daily/${day.date}`}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center justify-between rounded-lg px-2.5 py-2 text-sm transition-[background-color,box-shadow,color]",
                    // The current day lifts off the rail as a small white card.
                    active
                      ? "bg-white font-medium text-indigo-700 shadow-lift ring-1 ring-slate-200/70"
                      : "text-slate-600 hover:bg-white/70 hover:text-slate-900",
                  )}
                >
                  <span className="truncate">
                    {day.date === today ? "Today" : formatDayShort(day.date)}
                  </span>
                  <span
                    className={cn(
                      "ml-2 rounded-full px-2 text-xs tabular-nums",
                      active
                        ? "bg-indigo-50 text-indigo-700"
                        : allDone
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-600",
                    )}
                    title={`${day.doneCount} of ${day.taskCount} done`}
                  >
                    {day.doneCount}/{day.taskCount}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}
