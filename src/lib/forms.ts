import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { ApiError } from "./api/client";

/**
 * Copies server-side validation errors (400 + `errors` map) into react-hook-form,
 * so they appear under the matching inputs - like Laravel's $errors bag.
 *
 * Spring names nested fields "links[0].url"; react-hook-form uses "links.0.url".
 * Errors for fields that are not in the form go to `root.server`.
 *
 * @returns true if the error was a validation error and has been shown in the form.
 */
export function applyServerErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  formFields: readonly string[],
): boolean {
  if (!(error instanceof ApiError) || !error.isValidationError) return false;

  const unknownMessages: string[] = [];
  for (const [field, messages] of Object.entries(error.fieldErrors)) {
    const name = field.replace(/\[(\d+)\]/g, ".$1");
    const rootField = name.split(".")[0];
    const message = messages.join(" ");
    if (formFields.includes(rootField)) {
      setError(name as Path<T>, { type: "server", message });
    } else {
      unknownMessages.push(`${field}: ${message}`);
    }
  }
  if (unknownMessages.length > 0) {
    setError("root.server", { type: "server", message: unknownMessages.join(" ") });
  }
  return true;
}
