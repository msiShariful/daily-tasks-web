"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ArchivedClientTable } from "./ArchivedClientTable";
import { ClientTable } from "./ClientTable";

const TABS = [
  { key: "active", label: "Clients" },
  { key: "archived", label: "Archive" },
] as const;

type Tab = (typeof TABS)[number]["key"];

/** Switches between the live client list and the archive of deleted ones. */
export function ClientsView() {
  const [tab, setTab] = useState<Tab>("active");

  return (
    <div className="space-y-4">
      <div role="tablist" aria-label="Client lists" className="flex gap-1 border-b border-slate-200">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={cn(
              "-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors",
              tab === key
                ? "border-indigo-600 text-indigo-700"
                : "border-transparent text-slate-500 hover:text-slate-800",
            )}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === "active" ? <ClientTable /> : <ArchivedClientTable />}
    </div>
  );
}
