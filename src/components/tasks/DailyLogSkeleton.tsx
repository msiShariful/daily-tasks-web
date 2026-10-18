import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

/** Placeholder with the same shape as the real page, so nothing "jumps" when data arrives. */
export function DailyLogSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading daily log">
      {Array.from({ length: 3 }, (_, section) => (
        <Card key={section}>
          <div className="flex items-center gap-3 border-b border-slate-200/70 px-5 py-4">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-2 w-24" />
            </div>
            <Skeleton className="h-8 w-24" />
          </div>
          <div className="space-y-2 p-3">
            {Array.from({ length: 2 }, (_, row) => (
              <Skeleton key={row} className="h-16" />
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
