import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DailyLogView } from "@/components/tasks/DailyLogView";
import { formatDayMedium, isIsoDate } from "@/lib/dates";

// The URL /daily/2026-10-14 matches this folder: app/daily/[date]/page.tsx
// (Laravel: Route::get('/daily/{date}', ...)->where('date', '\d{4}-\d{2}-\d{2}')).

export async function generateMetadata({ params }: PageProps<"/daily/[date]">): Promise<Metadata> {
  const { date } = await params;
  return { title: isIsoDate(date) ? formatDayMedium(date) : "Daily log" };
}

export default async function DailyPage({ params }: PageProps<"/daily/[date]">) {
  const { date } = await params; // Next.js 15+: params is a Promise
  if (!isIsoDate(date)) notFound();

  // A Server Component that only validates the URL; the data loads in the Client Component.
  return <DailyLogView date={date} />;
}
