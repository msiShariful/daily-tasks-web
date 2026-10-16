import { z } from "zod";
import type { TeamMemberRequest, TeamMemberResponse } from "@/lib/api/types";

// Same rules as the backend TeamMemberRequest (like a Laravel FormRequest::rules()).
export const teamMemberSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Full name is required")
    .max(120, "Full name must be at most 120 characters"),
  email: z
    .email({ error: "Enter a valid email address" })
    .max(160, "Email must be at most 160 characters"),
  designation: z.string().trim().max(80, "Designation must be at most 80 characters"),
  active: z.boolean(),
  displayOrder: z
    .number({ error: "Display order must be a number" })
    .int("Display order must be a whole number")
    .min(0, "Display order cannot be negative"),
});

export type TeamMemberFormValues = z.infer<typeof teamMemberSchema>;

export const TEAM_MEMBER_FORM_FIELDS = Object.keys(teamMemberSchema.shape);

export const emptyTeamMemberForm: TeamMemberFormValues = {
  fullName: "",
  email: "",
  designation: "",
  active: true,
  displayOrder: 0,
};

export function teamMemberToFormValues(member: TeamMemberResponse): TeamMemberFormValues {
  return {
    fullName: member.fullName,
    email: member.email,
    designation: member.designation ?? "",
    active: member.active,
    displayOrder: member.displayOrder,
  };
}

export function toTeamMemberRequest(values: TeamMemberFormValues): TeamMemberRequest {
  return {
    fullName: values.fullName,
    email: values.email,
    designation: values.designation === "" ? null : values.designation,
    active: values.active,
    displayOrder: values.displayOrder,
  };
}
