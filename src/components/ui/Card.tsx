import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("rounded-lg bg-white shadow-xs ring-1 ring-slate-200", className)}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("flex items-center gap-3 border-b border-slate-200 px-4 py-3", className)}
      {...props}
    />
  );
}

export function CardBody({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("p-4", className)} {...props} />;
}
