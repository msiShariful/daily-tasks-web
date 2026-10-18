import type { Metadata } from "next";
import { ClientTable } from "@/components/clients/ClientTable";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata: Metadata = { title: "Clients" };

export default function ClientsPage() {
  return (
    <>
      <PageHeader
        title="Clients"
        description="Who the work is for. Tasks without a client are internal."
      />
      <ClientTable />
    </>
  );
}
