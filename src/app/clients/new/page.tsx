import type { Metadata } from "next";
import { ClientForm } from "@/components/clients/ClientForm";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata: Metadata = { title: "New client" };

export default function NewClientPage() {
  return (
    <div className="max-w-2xl">
      <PageHeader title="New client" />
      <ClientForm />
    </div>
  );
}
