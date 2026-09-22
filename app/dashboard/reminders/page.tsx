import { requireGarageAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";
import { generateRemindersAction, sendReminderAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function RemindersPage() {
  const session = await requireGarageAdmin();
  const reminders = await sql<{ id:string; status:string; due_at:string; sent_at:string|null; subject:string; error_message:string|null; first_name:string; last_name:string; email:string; vehicle:string }[]>`
    SELECT r.id,r.status,r.due_at::text,r.sent_at::text,r.subject,r.error_message,c.first_name,c.last_name,c.email,c.vehicle
    FROM reminders r JOIN clients c ON c.id=r.client_id
    WHERE r.garage_id=${session.garageId} ORDER BY r.created_at DESC LIMIT 300
  `;
  return <><header className="page-head"><div><h1>Rappels</h1><p className="muted">Générez les rappels dus, contrôlez-les puis envoyez-les.</p></div><form action={generateRemindersAction}><button className="button" type="submit">Actualiser les rappels</button></form></header>
    <div className="table-wrap">{reminders.length ? <table><thead><tr><th>Client</th><th>Rappel</th><th>État</th><th></th></tr></thead><tbody>{reminders.map((r) => <tr key={r.id}><td><strong>{r.first_name} {r.last_name}</strong><br /><span className="muted">{r.email} · {r.vehicle}</span></td><td>{r.subject}<br /><span className="muted">Prévu le {new Intl.DateTimeFormat("fr-BE", { dateStyle:"medium", timeStyle:"short" }).format(new Date(r.due_at))}</span>{r.error_message && <><br /><span className="danger-text">{r.error_message}</span></>}</td><td><span className={`badge ${r.status.toLowerCase()}`}>{r.status === "SENT" ? "Envoyé" : r.status === "FAILED" ? "Erreur" : r.status === "SKIPPED" ? "Ignoré" : "En attente"}</span></td><td>{r.status !== "SENT" && r.status !== "SKIPPED" && <form action={sendReminderAction}><input type="hidden" name="id" value={r.id} /><button className="button secondary small" type="submit">Envoyer maintenant</button></form>}</td></tr>)}</tbody></table> : <div className="empty">Aucun rappel généré.</div>}</div>
  </>;
}
