import type { DefaultValues } from "react-hook-form";
import { z } from "zod";
import type { ClientRequest, ClientResponse } from "@/lib/api/types";

export const clientSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(120, "Name must be at most 120 characters"),
  // An empty number input reads as NaN, which fails here with the same message.
  ticketId: z
    .number({ error: "Enter the ticket number" })
    .int("Ticket ID must be a whole number")
    .positive("Ticket ID must be positive"),
  notes: z.string().trim(),
  active: z.boolean(),
});

export type ClientFormValues = z.infer<typeof clientSchema>;

export const CLIENT_FORM_FIELDS = Object.keys(clientSchema.shape);

/** ticketId is left out so the field starts empty rather than showing 0. */
export const emptyClientForm: DefaultValues<ClientFormValues> = {
  name: "",
  notes: "",
  active: true,
};

export function clientToFormValues(client: ClientResponse): ClientFormValues {
  return {
    name: client.name,
    ticketId: client.ticketId,
    notes: client.notes ?? "",
    active: client.active,
  };
}

export function toClientRequest(values: ClientFormValues): ClientRequest {
  return {
    name: values.name,
    ticketId: values.ticketId,
    notes: values.notes === "" ? null : values.notes,
    active: values.active,
  };
}
