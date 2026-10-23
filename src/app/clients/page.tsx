import type { Metadata } from "next";
import { ClientsView } from "@/components/clients/ClientsView";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata: Metadata = { title: "Clients" };

export default function ClientsPage() {
  return (
    <>
      <PageHeader
        title="Clients"
        description="Who the work is for. Tasks without a client are internal."
      />
      <ClientsView />
    </>
  );
}
