import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "./Spinner";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "sm" | "md";

const variantClasses: Record<Variant, string> = {
  primary: "bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:outline-indigo-600",
  secondary:
    "bg-white text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus-visible:outline-indigo-600",
  danger: "bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-600",
  ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-indigo-600",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-8 px-2.5 text-xs gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
};

/** Shared classes, also used to style <Link> elements as buttons. */
export function buttonClasses(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(
    "inline-flex shrink-0 items-center justify-center rounded-md font-medium transition-colors",
    "focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50",
    variantClasses[variant],
    sizeClasses[size],
    className,
  );
}

interface ButtonProps extends ComponentProps<"button"> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  className,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClasses(variant, size, className)}
      {...props}
    >
      {loading && <Spinner className="size-3.5" label="Working" />}
      {children}
    </button>
  );
}
