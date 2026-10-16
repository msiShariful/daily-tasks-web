import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { TaskSearchView } from "@/components/tasks/TaskSearchView";
import { Spinner } from "@/components/ui/Spinner";

export const metadata: Metadata = { title: "Search tasks" };

export default function TasksPage() {
  return (
    <>
      <PageHeader
        title="Search tasks"
        description="Find any task across all days by text, member, client or status."
      />
      {/* useSearchParams() inside TaskSearchView needs a Suspense boundary for `next build`. */}
      <Suspense fallback={<Spinner className="text-indigo-600" label="Loading search" />}>
        <TaskSearchView />
      </Suspense>
    </>
  );
}
