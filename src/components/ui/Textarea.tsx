import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { fieldClasses } from "./Input";

export function Textarea({ className, rows = 3, ...props }: ComponentProps<"textarea">) {
  return <textarea rows={rows} className={cn(fieldClasses, "resize-y", className)} {...props} />;
}
