"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { buttonClasses } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useTaskSearch } from "@/hooks/use-tasks";
import { formatDayMedium } from "@/lib/dates";
import { parseTaskSearchParams, taskSearchHref } from "@/lib/task-search-params";
import { cn } from "@/lib/utils";
import { StatusBadge } from "./StatusBadge";
import { TaskFilters } from "./TaskFilters";

/** /tasks - search all history. Filters + page number live in the URL, so results are shareable. */
export function TaskSearchView() {
  const searchParams = useSearchParams();
  const params = parseTaskSearchParams(searchParams);
  const { data, isPending, isError, error, refetch, isPlaceholderData } = useTaskSearch(params);

  const page = params.page ?? 0;

  return (
    <div className="space-y-4">
      <TaskFilters key={searchParams.toString()} params={params} />

      {isPending && (
        <Card className="space-y-3 p-4">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-8" />
          ))}
        </Card>
      )}

      {isError && <ErrorState error={error} onRetry={() => refetch()} />}

      {data && data.totalElements === 0 && (
        <EmptyState title="No tasks found" description="Try removing some filters." />
      )}

      {data && data.totalElements > 0 && (
        <>
          <p className="text-sm text-slate-500" aria-live="polite">
            {data.totalElements} task{data.totalElements === 1 ? "" : "s"} found
          </p>
          <Card className={cn("overflow-x-auto transition-opacity", isPlaceholderData && "opacity-60")}>
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50/80 text-left text-xs font-medium text-slate-500">
                <tr>
                  <th scope="col" className="px-4 py-3">Date</th>
                  <th scope="col" className="px-4 py-3">Member</th>
                  <th scope="col" className="px-4 py-3">Client</th>
                  <th scope="col" className="px-4 py-3">Task ID</th>
                  <th scope="col" className="px-4 py-3">Description</th>
                  <th scope="col" className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.content.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap px-4 py-3">
                      <Link
                        href={`/daily/${task.workDate}`}
                        className="font-medium text-indigo-600 hover:underline"
                      >
                        {formatDayMedium(task.workDate)}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                      {task.teamMember.fullName}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {task.client?.name ?? "Internal"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-slate-600">
                      {task.taskCode ?? "—"}
                    </td>
                    <td className="max-w-md px-4 py-3 text-slate-900">
                      <span className="line-clamp-2">{task.title}</span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <StatusBadge status={task.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <nav aria-label="Pagination" className="flex items-center justify-between gap-2">
            <PageLink disabled={page <= 0} href={taskSearchHref({ ...params, page: page - 1 })}>
              ← Previous
            </PageLink>
            <span className="text-sm text-slate-600">
              Page {data.page + 1} of {Math.max(data.totalPages, 1)}
            </span>
            <PageLink
              disabled={page + 1 >= data.totalPages}
              href={taskSearchHref({ ...params, page: page + 1 })}
            >
              Next →
            </PageLink>
          </nav>
        </>
      )}
    </div>
  );
}

function PageLink({
  href,
  disabled,
  children,
}: {
  href: string;
  disabled: boolean;
  children: ReactNode;
}) {
  if (disabled) {
    return (
      <span aria-disabled="true" className={buttonClasses("secondary", "sm", "opacity-50")}>
        {children}
      </span>
    );
  }
  return (
    <Link href={href} className={buttonClasses("secondary", "sm")} scroll={false}>
      {children}
    </Link>
  );
}
