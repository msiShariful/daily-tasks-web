import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { TeamMemberForm } from "@/components/team-members/TeamMemberForm";

export const metadata: Metadata = { title: "New team member" };

export default function NewTeamMemberPage() {
  return (
    <div className="max-w-2xl">
      <PageHeader title="New team member" />
      <TeamMemberForm />
    </div>
  );
}
