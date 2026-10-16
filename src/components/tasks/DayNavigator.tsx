"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { buttonClasses } from "@/components/ui/Button";
import type { IsoDate } from "@/lib/api/types";
import { addDaysIso, isIsoDate, todayIso } from "@/lib/dates";

/** ← Prev · Today · Next → plus a date picker. Each day is its own URL: /daily/2026-10-14 */
export function DayNavigator({ date }: { date: IsoDate }) {
  const router = useRouter();
  const today = todayIso();

  return (
    <nav aria-label="Change day" className="flex flex-wrap items-center gap-2">
      <Link
        href={`/daily/${addDaysIso(date, -1)}`}
        className={buttonClasses("secondary", "sm")}
        aria-label="Previous day"
      >
        ← Prev
      </Link>
      <Link
        href={`/daily/${today}`}
        className={buttonClasses("secondary", "sm")}
        aria-disabled={date === today || undefined}
      >
        Today
      </Link>
      <Link
        href={`/daily/${addDaysIso(date, 1)}`}
        className={buttonClasses("secondary", "sm")}
        aria-label="Next day"
      >
        Next →
      </Link>
      <label htmlFor="day-picker" className="sr-only">
        Go to date
      </label>
      <input
        id="day-picker"
        type="date"
        value={date}
        onChange={(event) => {
          const value = event.target.value;
          if (isIsoDate(value)) router.push(`/daily/${value}`);
        }}
        className="h-8 rounded-md border-0 bg-white px-2 text-xs text-slate-700 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-indigo-600"
      />
    </nav>
  );
}
