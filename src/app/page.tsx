// Temporary home page for plans 1-3. Plan 4 replaces it with a redirect to today's log.
export default function HomePage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">Daily Tasks</h1>
      <p className="mt-2 text-slate-600">
        Next.js is running. If this text is dark grey on a light background and the heading is
        bold, Tailwind CSS works too.
      </p>
      <div className="mt-6 inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white">
        Tailwind v4 ✓
      </div>
    </main>
  );
}
