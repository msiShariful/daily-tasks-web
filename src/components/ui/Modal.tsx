"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
  /** "center" is a classic dialog; "right" slides in as a panel over the page. */
  placement?: "center" | "right";
}

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

const placementClasses = {
  center: "m-auto w-[calc(100%-2rem)] rounded-2xl starting:open:translate-y-2 starting:open:opacity-0",
  // The UA sheet centres <dialog> with auto margins and caps its height; undo both.
  right:
    "mr-0 ml-auto my-0 h-dvh max-h-none w-full rounded-none starting:open:translate-x-full",
};

/**
 * Accessible dialog built on the native <dialog> element:
 * showModal() gives us focus trapping, Esc-to-close and a backdrop for free.
 * Children are only rendered while open, so forms start fresh every time.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  placement = "center",
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => {
        // A click on the backdrop targets the <dialog> element itself.
        if (event.target === event.currentTarget) onClose();
      }}
      className={cn(
        "bg-white p-0 text-slate-900 shadow-pop backdrop:bg-slate-900/40 backdrop:backdrop-blur-sm",
        "transition-[translate,opacity] duration-300 ease-out motion-reduce:transition-none",
        placementClasses[placement],
        sizeClasses[size],
      )}
    >
      {open && (
        <div className={cn("flex flex-col", placement === "right" ? "h-full" : "max-h-[85vh]")}>
          <div className="border-b border-slate-200/70 px-6 py-5">
            <h2 id={titleId} className="text-base font-semibold">
              {title}
            </h2>
            {description && <div className="mt-1 text-sm text-slate-500">{description}</div>}
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
          {footer && (
            <div className="flex justify-end gap-2 border-t border-slate-200/70 bg-slate-50/80 px-6 py-4">
              {footer}
            </div>
          )}
        </div>
      )}
    </dialog>
  );
}
