import Link from "next/link";
import { ClientForm } from "@/components/client-form";
import { createClientAction } from "../actions";

export default async function NewClientPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <><header className="page-head"><div><Link href="/dashboard/clients">← Clients</Link><h1>Nouveau client</h1></div></header>{error && <p className="error">{error}</p>}<ClientForm action={createClientAction} submitLabel="Enregistrer le client" /></>;
}
