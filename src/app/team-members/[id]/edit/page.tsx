import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { TeamMemberForm } from "@/components/team-members/TeamMemberForm";

export const metadata: Metadata = { title: "Edit team member" };

// Next.js 15+: params is a Promise - always `await` it.
export default async function EditTeamMemberPage({ params }: PageProps<"/team-members/[id]/edit">) {
  const { id } = await params;
  const memberId = Number(id);
  if (!Number.isInteger(memberId) || memberId <= 0) notFound();

  return (
    <div className="max-w-2xl">
      <PageHeader title="Edit team member" />
      <TeamMemberForm memberId={memberId} />
    </div>
  );
}
