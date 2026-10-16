"use client";

import {
  useFieldArray,
  type Control,
  type FieldErrors,
  type UseFormRegister,
} from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { FieldError } from "@/components/ui/FieldError";
import { Input } from "@/components/ui/Input";
import { MAX_LINKS, type TaskFormValues } from "@/lib/schemas/task";

interface TaskLinksFieldProps {
  control: Control<TaskFormValues>;
  register: UseFormRegister<TaskFormValues>;
  errors: FieldErrors<TaskFormValues>;
}

/**
 * A repeatable "label + URL" list. useFieldArray manages add/remove and keeps
 * stable keys for each row - like a Livewire array property with wire:model.
 */
export function TaskLinksField({ control, register, errors }: TaskLinksFieldProps) {
  const { fields, append, remove } = useFieldArray({ control, name: "links" });

  return (
    <fieldset>
      <legend className="text-sm font-medium text-slate-700">Links</legend>
      <p className="text-xs text-slate-500">Jira ticket, PR, Figma, build…</p>

      {fields.length > 0 && (
        <ul className="mt-2 space-y-2">
          {fields.map((field, index) => {
            const labelError = errors.links?.[index]?.label?.message;
            const urlError = errors.links?.[index]?.url?.message;
            return (
              // field.id (not index) is the React key: rows keep their state when one is removed.
              <li key={field.id} className="flex items-start gap-2">
                <div className="w-36 shrink-0">
                  <Input
                    aria-label={`Link ${index + 1} label`}
                    placeholder="Label"
                    aria-invalid={labelError ? true : undefined}
                    {...register(`links.${index}.label`)}
                  />
                  <FieldError message={labelError} />
                </div>
                <div className="min-w-0 flex-1">
                  <Input
                    type="url"
                    aria-label={`Link ${index + 1} URL`}
                    placeholder="https://…"
                    aria-invalid={urlError ? true : undefined}
                    {...register(`links.${index}.url`)}
                  />
                  <FieldError message={urlError} />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-1"
                  aria-label={`Remove link ${index + 1}`}
                  onClick={() => remove(index)}
                >
                  ✕
                </Button>
              </li>
            );
          })}
        </ul>
      )}

      <FieldError message={errors.links?.message ?? errors.links?.root?.message} />

      <Button
        variant="secondary"
        size="sm"
        className="mt-2"
        disabled={fields.length >= MAX_LINKS}
        onClick={() => append({ label: "", url: "" })}
      >
        + Add link
      </Button>
    </fieldset>
  );
}
