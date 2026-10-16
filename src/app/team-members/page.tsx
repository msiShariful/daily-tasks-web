import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { TeamMemberTable } from "@/components/team-members/TeamMemberTable";
import { buttonClasses } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Team" };

export default function TeamMembersPage() {
  return (
    <>
      <PageHeader
        title="Team members"
        description="People whose tasks appear on the daily log."
        actions={
          <Link href="/team-members/new" className={buttonClasses()}>
            Add team member
          </Link>
        }
      />
      <TeamMemberTable />
    </>
  );
}
