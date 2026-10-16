import { z } from "zod";
import {
  TASK_STATUS_CODES,
  type IsoDate,
  type TaskRequest,
  type TaskResponse,
} from "@/lib/api/types";

export const MAX_LINKS = 20;

export const taskLinkSchema = z.object({
  label: z.string().trim().max(100, "Label must be at most 100 characters"),
  url: z
    .url({ protocol: /^https?$/, error: "Enter a full http:// or https:// URL" })
    .max(2048, "URL must be at most 2048 characters"),
});

export const taskSchema = z.object({
  workDate: z.iso.date({ error: "Pick a valid date" }),
  // <select> values are strings; we convert to numbers in toTaskRequest()
  teamMemberId: z.string().min(1, "Choose a team member"),
  clientId: z.string(), // "" = internal task (no client)
  taskCode: z.string().trim().max(50, "Task ID must be at most 50 characters"),
  title: z
    .string()
    .trim()
    .min(1, "Short description is required")
    .max(255, "Short description must be at most 255 characters"),
  details: z.string().trim(),
  status: z.enum(TASK_STATUS_CODES),
  links: z.array(taskLinkSchema).max(MAX_LINKS, `At most ${MAX_LINKS} links`),
});

export type TaskFormValues = z.infer<typeof taskSchema>;
export type TaskLinkFormValues = z.infer<typeof taskLinkSchema>;

export const TASK_FORM_FIELDS = Object.keys(taskSchema.shape);

export function emptyTaskForm(workDate: IsoDate, teamMemberId?: number): TaskFormValues {
  return {
    workDate,
    teamMemberId: teamMemberId ? String(teamMemberId) : "",
    clientId: "",
    taskCode: "",
    title: "",
    details: "",
    status: "TODO",
    links: [],
  };
}

export function taskToFormValues(task: TaskResponse): TaskFormValues {
  return {
    workDate: task.workDate,
    teamMemberId: String(task.teamMember.id),
    clientId: task.client ? String(task.client.id) : "",
    taskCode: task.taskCode ?? "",
    title: task.title,
    details: task.details ?? "",
    status: task.status,
    links: task.links.map((link) => ({ label: link.label ?? "", url: link.url })),
  };
}

export function toTaskRequest(values: TaskFormValues, version?: number): TaskRequest {
  return {
    workDate: values.workDate,
    teamMemberId: Number(values.teamMemberId),
    clientId: values.clientId === "" ? null : Number(values.clientId),
    taskCode: values.taskCode === "" ? null : values.taskCode,
    title: values.title,
    details: values.details === "" ? null : values.details,
    status: values.status,
    links: values.links.map((link) => ({
      label: link.label === "" ? null : link.label,
      url: link.url,
    })),
    version,
  };
}
