import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { fieldClasses } from "./Input";

export function Select({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <select className={cn(fieldClasses, "pr-8", className)} {...props}>
      {children}
    </select>
  );
}
