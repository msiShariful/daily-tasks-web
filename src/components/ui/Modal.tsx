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
}

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
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
        "m-auto w-[calc(100%-2rem)] rounded-xl bg-white p-0 text-slate-900 shadow-xl backdrop:bg-slate-900/50",
        sizeClasses[size],
      )}
    >
      {open && (
        <div className="flex max-h-[85vh] flex-col">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 id={titleId} className="text-base font-semibold">
              {title}
            </h2>
            {description && <div className="mt-1 text-sm text-slate-500">{description}</div>}
          </div>
          <div className="overflow-y-auto px-5 py-4">{children}</div>
          {footer && (
            <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3">
              {footer}
            </div>
          )}
        </div>
      )}
    </dialog>
  );
}
