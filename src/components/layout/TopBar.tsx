"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  // "/" redirects to today's log (see app/page.tsx)
  { href: "/", label: "Daily log", match: "/daily" },
  { href: "/tasks", label: "Search tasks", match: "/tasks" },
  { href: "/team-members", label: "Team", match: "/team-members" },
  { href: "/clients", label: "Clients", match: "/clients" },
];

export function TopBar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold text-slate-900">
          <span
            aria-hidden="true"
            className="grid size-7 place-items-center rounded-md bg-indigo-600 text-xs font-bold text-white"
          >
            DT
          </span>
          <span className="hidden sm:inline">Daily Tasks</span>
        </Link>

        <nav aria-label="Main" className="flex items-center gap-1 overflow-x-auto">
          {navItems.map((item) => {
            const active = pathname === item.match || pathname.startsWith(`${item.match}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium",
                  active
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Phase 3 adds the signed-in user + logout button here. */}
        <div className="ml-auto flex items-center gap-2" />
      </div>
    </header>
  );
}
