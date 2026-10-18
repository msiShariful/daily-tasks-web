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
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-5 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 font-semibold text-slate-900">
          <span
            aria-hidden="true"
            className="grid size-8 place-items-center rounded-lg bg-linear-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white shadow-[0_1px_2px_0_rgb(79_70_229/0.35)]"
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
                  "whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
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
