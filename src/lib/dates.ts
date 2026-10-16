import { addDays, format, isValid, parseISO, subDays } from "date-fns";

/** The team works in Bangladesh, so "today" is always computed in this zone. */
export const APP_TIME_ZONE = "Asia/Dhaka";

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Today's date in Asia/Dhaka as "yyyy-MM-dd", no matter where the browser/server is. */
export function todayIso(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/** True for real calendar dates in "yyyy-MM-dd" form ("2026-02-30" is false). */
export function isIsoDate(value: string | null | undefined): value is string {
  if (!value || !ISO_DATE_PATTERN.test(value)) return false;
  const date = parseISO(value);
  return isValid(date) && format(date, "yyyy-MM-dd") === value;
}

/** Date object -> "yyyy-MM-dd" (uses the Date's local calendar day). */
export function toIsoDate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

/** "2026-10-14" + 1 -> "2026-10-15" */
export function addDaysIso(isoDate: string, amount: number): string {
  return toIsoDate(addDays(parseISO(isoDate), amount));
}

/** The date `days` days before today (Asia/Dhaka). */
export function daysAgoIso(days: number): string {
  return toIsoDate(subDays(parseISO(todayIso()), days));
}

/** "2026-10-14" -> "Wednesday, 14 October 2026" */
export function formatDayLong(isoDate: string): string {
  return format(parseISO(isoDate), "EEEE, d MMMM yyyy");
}

/** "2026-10-14" -> "Wed, 14 Oct" */
export function formatDayShort(isoDate: string): string {
  return format(parseISO(isoDate), "EEE, d MMM");
}

/** "2026-10-14" -> "14 Oct 2026" */
export function formatDayMedium(isoDate: string): string {
  return format(parseISO(isoDate), "d MMM yyyy");
}

/** ISO instant -> "14 Oct 2026, 12:30" in the browser's time zone. */
export function formatDateTime(isoInstant: string): string {
  return format(new Date(isoInstant), "d MMM yyyy, HH:mm");
}
