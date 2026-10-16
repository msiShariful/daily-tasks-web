import type { Metadata } from "next";
import Link from "next/link";
import { ClientTable } from "@/components/clients/ClientTable";
import { PageHeader } from "@/components/layout/PageHeader";
import { buttonClasses } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Clients" };

export default function ClientsPage() {
  return (
    <>
      <PageHeader
        title="Clients"
        description="Who the work is for. Tasks without a client are internal."
        actions={
          <Link href="/clients/new" className={buttonClasses()}>
            Add client
          </Link>
        }
      />
      <ClientTable />
    </>
  );
}
