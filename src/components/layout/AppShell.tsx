import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

/**
 * The page frame: top bar + day sidebar + content.
 * Like a Blade layout (layouts/app.blade.php) where {children} is @yield('content').
 * It is a Server Component; TopBar and Sidebar are Client Components inside it.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <TopBar />
      <div className="mx-auto flex w-full max-w-7xl flex-1">
        <Sidebar />
        <main id="main" className="min-w-0 flex-1 px-4 py-6 sm:px-6">
          {children}
        </main>
      </div>
    </div>
  );
}
