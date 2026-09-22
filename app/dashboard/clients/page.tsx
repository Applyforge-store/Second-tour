import Link from "next/link";
import { requireGarageAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";
import { archiveClientAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function ClientsPage({ searchParams }: { searchParams: Promise<{ success?: string }> }) {
  const session = await requireGarageAdmin();
  const { success } = await searchParams;
  const clients = await sql<{ id:string; first_name:string; last_name:string; email:string; vehicle:string; plate:string; next_service_date:string; email_consent:boolean }[]>`
    SELECT id, first_name, last_name, email, vehicle, plate, next_service_date::text, email_consent
    FROM clients WHERE garage_id=${session.garageId} AND active=true ORDER BY next_service_date ASC
  `;
  return <><header className="page-head"><div><h1>Clients</h1><p className="muted">Chaque rappel exige un consentement enregistré.</p></div><div className="actions"><Link className="button secondary" href="/dashboard/clients/import">Importer un CSV</Link><Link className="button" href="/dashboard/clients/new">Ajouter</Link></div></header>
    {success && <p className="success flash">{success}</p>}
    <div className="table-wrap">{clients.length ? <table><thead><tr><th>Client</th><th>Véhicule</th><th>Échéance</th><th>Consentement</th><th></th></tr></thead><tbody>{clients.map((c) => <tr key={c.id}><td><strong>{c.first_name} {c.last_name}</strong><br /><span className="muted">{c.email}</span></td><td>{c.vehicle}<br /><span className="muted">{c.plate}</span></td><td>{new Intl.DateTimeFormat("fr-BE", { dateStyle: "medium" }).format(new Date(c.next_service_date))}</td><td><span className={`badge ${c.email_consent ? "sent" : "failed"}`}>{c.email_consent ? "Oui" : "Non"}</span></td><td><div className="actions"><Link className="button secondary small" href={`/dashboard/clients/${c.id}`}>Modifier</Link><form className="inline-form" action={archiveClientAction}><input type="hidden" name="id" value={c.id} /><button className="button danger small" type="submit">Archiver</button></form></div></td></tr>)}</tbody></table> : <div className="empty">Aucun client actif.</div>}</div>
  </>;
}
