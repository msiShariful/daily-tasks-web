"use client";

import { Card, CardHeader } from "@/components/ui/Card";
import type { MemberTasksResponse } from "@/lib/api/types";
import { TaskCard } from "./TaskCard";

interface MemberSectionProps {
  section: MemberTasksResponse;
}

/** One team member's block on the daily log: header with progress + their tasks. */
export function MemberSection({ section }: MemberSectionProps) {
  const { member, tasks, total, done } = section;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  const headingId = `member-${member.id}-heading`;

  return (
    <Card>
      <section aria-labelledby={headingId}>
        <CardHeader>
          <div className="min-w-0 flex-1">
            <h2 id={headingId} className="truncate text-sm font-semibold text-slate-900">
              {member.fullName}
            </h2>
            <div className="mt-1 flex items-center gap-2">
              <div
                className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-200"
                role="progressbar"
                aria-label={`${member.fullName} progress`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={percent}
              >
                <div className="h-full bg-green-500 transition-all" style={{ width: `${percent}%` }} />
              </div>
              <span className="text-xs tabular-nums text-slate-500">
                {done}/{total} done
              </span>
            </div>
          </div>
        </CardHeader>

        <div className="p-3">
          {tasks.length === 0 ? (
            <p className="px-1 py-2 text-sm text-slate-400">No tasks for this day.</p>
          ) : (
            <ol className="space-y-2">
              {tasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </ol>
          )}
        </div>
      </section>
    </Card>
  );
}
