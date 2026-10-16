import { z } from "zod";
import type { ClientRequest, ClientResponse } from "@/lib/api/types";

export const clientSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(120, "Name must be at most 120 characters"),
  notes: z.string().trim(),
  active: z.boolean(),
});

export type ClientFormValues = z.infer<typeof clientSchema>;

export const CLIENT_FORM_FIELDS = Object.keys(clientSchema.shape);

export const emptyClientForm: ClientFormValues = {
  name: "",
  notes: "",
  active: true,
};

export function clientToFormValues(client: ClientResponse): ClientFormValues {
  return {
    name: client.name,
    notes: client.notes ?? "",
    active: client.active,
  };
}

export function toClientRequest(values: ClientFormValues): ClientRequest {
  return {
    name: values.name,
    notes: values.notes === "" ? null : values.notes,
    active: values.active,
  };
}
