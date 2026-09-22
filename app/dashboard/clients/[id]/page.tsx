import { notFound } from "next/navigation";
import Link from "next/link";
import { requireGarageAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";
import { ClientForm } from "@/components/client-form";
import { updateClientAction } from "../actions";

export default async function EditClientPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const session = await requireGarageAdmin(); const { id } = await params; const { error } = await searchParams;
  const [client] = await sql<{ first_name:string; last_name:string; email:string; phone:string; vehicle:string; plate:string; last_service_date:string|null; next_service_date:string; email_consent:boolean }[]>`
    SELECT first_name,last_name,email,phone,vehicle,plate,last_service_date::text,next_service_date::text,email_consent FROM clients WHERE id=${id} AND garage_id=${session.garageId} LIMIT 1
  `;
  if (!client) notFound();
  const action = updateClientAction.bind(null, id);
  return <><header className="page-head"><div><Link href="/dashboard/clients">← Clients</Link><h1>Modifier le client</h1></div></header>{error && <p className="error">{error}</p>}<ClientForm action={action} values={client} submitLabel="Enregistrer les modifications" /></>;
}
