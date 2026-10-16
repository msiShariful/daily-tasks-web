import { getErrorMessage } from "@/lib/api/client";
import { Button } from "./Button";

interface ErrorStateProps {
  error: unknown;
  onRetry?: () => void;
  title?: string;
}

/** Shown when a query fails (API down, 500, ...). */
export function ErrorState({ error, onRetry, title = "Could not load data" }: ErrorStateProps) {
  return (
    <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-4">
      <p className="text-sm font-semibold text-red-800">{title}</p>
      <p className="mt-1 text-sm text-red-700">{getErrorMessage(error)}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" className="mt-3" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
