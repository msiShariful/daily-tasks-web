import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClientForm } from "@/components/clients/ClientForm";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata: Metadata = { title: "Edit client" };

export default async function EditClientPage({ params }: PageProps<"/clients/[id]/edit">) {
  const { id } = await params;
  const clientId = Number(id);
  if (!Number.isInteger(clientId) || clientId <= 0) notFound();

  return (
    <div className="max-w-2xl">
      <PageHeader title="Edit client" />
      <ClientForm clientId={clientId} />
    </div>
  );
}
