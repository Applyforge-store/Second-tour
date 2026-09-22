import Link from "next/link";
import { requireGarageAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await requireGarageAdmin();
  const [garage] = await sql<{ name: string }[]>`SELECT name FROM garages WHERE id = ${session.garageId}`;
  const [stats] = await sql<{ clients: number; pending: number; sent: number }[]>`
    SELECT
      (SELECT count(*)::int FROM clients WHERE garage_id = ${session.garageId} AND active = true) AS clients,
      (SELECT count(*)::int FROM reminders WHERE garage_id = ${session.garageId} AND status = 'PENDING') AS pending,
      (SELECT count(*)::int FROM reminders WHERE garage_id = ${session.garageId} AND status = 'SENT' AND sent_at >= date_trunc('month', now())) AS sent
  `;
  const upcoming = await sql<{ id: string; first_name: string; last_name: string; vehicle: string; next_service_date: string }[]>`
    SELECT id, first_name, last_name, vehicle, next_service_date::text
    FROM clients WHERE garage_id = ${session.garageId} AND active = true
    ORDER BY next_service_date ASC LIMIT 8
  `;
  return <>
    <header className="page-head"><div><p className="eyebrow">{garage?.name}</p><h1>Tableau de bord</h1><p className="muted">Les prochaines échéances et l’état des envois.</p></div><Link className="button" href="/dashboard/clients/new">Ajouter un client</Link></header>
    <section className="stats">
      <div className="stat-card"><span>Clients actifs</span><strong>{stats?.clients ?? 0}</strong></div>
      <div className="stat-card"><span>Rappels en attente</span><strong>{stats?.pending ?? 0}</strong></div>
      <div className="stat-card"><span>Envoyés ce mois</span><strong>{stats?.sent ?? 0}</strong></div>
    </section>
    <section className="card"><div className="page-head"><div><h2>Prochains entretiens</h2></div><Link href="/dashboard/clients">Tous les clients</Link></div>
      {upcoming.length ? <div className="table-wrap"><table><thead><tr><th>Client</th><th>Véhicule</th><th>Prochain entretien</th></tr></thead><tbody>{upcoming.map((c) => <tr key={c.id}><td>{c.first_name} {c.last_name}</td><td>{c.vehicle}</td><td>{new Intl.DateTimeFormat("fr-BE", { dateStyle: "long" }).format(new Date(c.next_service_date))}</td></tr>)}</tbody></table></div> : <div className="empty">Ajoutez un premier client pour commencer.</div>}
    </section>
  </>;
}
