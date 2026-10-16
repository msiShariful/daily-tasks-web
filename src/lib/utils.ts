import { clsx, type ClassValue } from "clsx";

/**
 * Joins CSS class names, skipping false/null/undefined values.
 * cn("px-2", isActive && "bg-indigo-600") -> "px-2 bg-indigo-600" (or just "px-2")
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
