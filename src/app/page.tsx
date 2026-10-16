import { connection } from "next/server";
import { redirect } from "next/navigation";
import { todayIso } from "@/lib/dates";

// "/" -> "/daily/<today in Asia/Dhaka>"
export default async function HomePage() {
  // Without this, Next.js would pre-render "/" once at build time
  // and redirect to the build day forever. connection() makes it run per request.
  await connection();
  redirect(`/daily/${todayIso()}`);
}
