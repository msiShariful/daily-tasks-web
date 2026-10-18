import { cn } from "@/lib/utils";

/** Grey pulsing placeholder shown while data loads. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn("animate-pulse rounded-lg bg-slate-200/70", className)} />
  );
}
