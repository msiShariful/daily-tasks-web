"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { Button, buttonClasses } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAllClients } from "@/hooks/use-clients";
import { useTaskStatuses } from "@/hooks/use-task-statuses";
import { useTeamMembers } from "@/hooks/use-team-members";
import type { TaskSearchParams } from "@/lib/api/types";
import { FALLBACK_TASK_STATUSES } from "@/lib/task-status";
import { parseTaskSearchParams, SORT_OPTIONS, taskSearchHref } from "@/lib/task-search-params";

/**
 * Filter form whose state lives in the URL (?q=...&status=...), like a Blade GET form.
 * The inputs are uncontrolled (defaultValue); on submit we read them with FormData
 * and navigate. The parent gives this form a `key` built from the URL, so Back/Forward
 * re-creates it with the right values.
 */
export function TaskFilters({ params }: { params: TaskSearchParams }) {
  const router = useRouter();
  const membersQuery = useTeamMembers();
  const clientsQuery = useAllClients();
  const { data: statuses = FALLBACK_TASK_STATUSES } = useTaskStatuses();
  const members = membersQuery.data ?? [];
  const clients = clientsQuery.data ?? [];

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const values = new URLSearchParams();
    for (const [key, value] of formData) {
      if (typeof value === "string") values.set(key, value);
    }
    // Re-parse to validate, and start again from page 1 when filters change.
    const next = { ...parseTaskSearchParams(values), page: 0 };
    router.push(taskSearchHref(next));
  }

  // <select defaultValue> is applied only when the select is created, so wait for
  // the member/client options before rendering the form (otherwise ?memberId=2 is lost).
  if (membersQuery.isPending || clientsQuery.isPending) {
    return <Skeleton className="h-52 sm:h-40" />;
  }

  return (
    <form
      role="search"
      aria-label="Filter tasks"
      onSubmit={handleSubmit}
      className="grid gap-3 rounded-xl bg-white p-5 shadow-card ring-1 ring-slate-200/70 sm:grid-cols-2 lg:grid-cols-4"
    >
      <div className="sm:col-span-2">
        <Label htmlFor="filter-q">Search</Label>
        <Input
          id="filter-q"
          name="q"
          type="search"
          placeholder="Title, task ID or details…"
          defaultValue={params.q ?? ""}
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="filter-from">From</Label>
        <Input id="filter-from" name="from" type="date" defaultValue={params.from ?? ""} className="mt-1" />
      </div>
      <div>
        <Label htmlFor="filter-to">To</Label>
        <Input id="filter-to" name="to" type="date" defaultValue={params.to ?? ""} className="mt-1" />
      </div>
      <div>
        <Label htmlFor="filter-member">Team member</Label>
        <Select
          id="filter-member"
          name="memberId"
          defaultValue={params.memberId ? String(params.memberId) : ""}
          className="mt-1"
        >
          <option value="">Anyone</option>
          {members.map((member) => (
            <option key={member.id} value={String(member.id)}>
              {member.fullName}
              {member.active ? "" : " (inactive)"}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="filter-client">Client</Label>
        <Select
          id="filter-client"
          name="clientId"
          defaultValue={params.clientId ? String(params.clientId) : ""}
          className="mt-1"
        >
          <option value="">Any client</option>
          {clients.map((client) => (
            <option key={client.id} value={String(client.id)}>
              {client.name}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="filter-status">Status</Label>
        <Select id="filter-status" name="status" defaultValue={params.status ?? ""} className="mt-1">
          <option value="">Any status</option>
          {statuses.map((status) => (
            <option key={status.code} value={status.code}>
              {status.label}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="filter-sort">Sort</Label>
        <Select id="filter-sort" name="sort" defaultValue={params.sort} className="mt-1">
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>
      <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-4 lg:justify-end">
        <Link href="/tasks" className={buttonClasses("secondary")}>
          Reset
        </Link>
        <Button type="submit">Apply filters</Button>
      </div>
    </form>
  );
}
