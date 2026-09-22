import { requireSuperAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";
import { createGarageAction, toggleGarageAction } from "./actions";

export default async function GaragesPage({ searchParams }: { searchParams: Promise<{ success?:string; error?:string }> }) {
  await requireSuperAdmin(); const query=await searchParams;
  const garages=await sql<{id:string;name:string;contact_email:string;active:boolean;created_at:string;clients:number;sent:number;user_email:string}[]>`
    SELECT g.id,g.name,g.contact_email,g.active,g.created_at::text,
      count(DISTINCT c.id)::int AS clients,
      count(DISTINCT r.id) FILTER (WHERE r.status='SENT')::int AS sent,
      coalesce(max(u.email),'—') AS user_email
    FROM garages g LEFT JOIN clients c ON c.garage_id=g.id LEFT JOIN reminders r ON r.garage_id=g.id LEFT JOIN users u ON u.garage_id=g.id
    GROUP BY g.id ORDER BY g.created_at DESC
  `;
  const leads=await sql<{id:string;garage_name:string;contact_name:string;email:string;message:string;created_at:string}[]>`SELECT id,garage_name,contact_name,email,message,created_at::text FROM leads WHERE status='NEW' ORDER BY created_at DESC LIMIT 50`;
  return <><header className="page-head"><div><p className="eyebrow">Administration</p><h1>Garages</h1><p className="muted">Créez l’espace d’un client uniquement après accord.</p></div></header>
    {query.success&&<p className="success">{query.success}</p>}{query.error&&<p className="error">{query.error}</p>}
    <section className="grid-two"><form action={createGarageAction} className="card"><h2>Nouveau garage</h2><div className="field"><label htmlFor="name">Nom du garage</label><input id="name" name="name" required /></div><div className="field"><label htmlFor="contactEmail">Adresse de réponse</label><input id="contactEmail" name="contactEmail" type="email" required /></div><div className="field"><label htmlFor="userEmail">E-mail de connexion</label><input id="userEmail" name="userEmail" type="email" required /></div><div className="field"><label htmlFor="initialPassword">Mot de passe initial</label><input id="initialPassword" name="initialPassword" type="password" minLength={12} required /></div><button className="button" type="submit">Créer l’espace</button></form>
      <div className="card"><h2>Avant l’activation</h2><p className="muted">Le garage doit confirmer son adresse de réponse, son modèle de rappel et que les clients importés ont consenti aux communications. Transmettez le mot de passe initial par un canal distinct de l’e-mail de connexion.</p></div></section>
    <section style={{marginTop:20}} className="table-wrap">{garages.length?<table><thead><tr><th>Garage</th><th>Compte</th><th>Clients</th><th>Envoyés</th><th>État</th></tr></thead><tbody>{garages.map(g=><tr key={g.id}><td><strong>{g.name}</strong><br/><span className="muted">{g.contact_email}</span></td><td>{g.user_email}</td><td>{g.clients}</td><td>{g.sent}</td><td><form action={toggleGarageAction}><input type="hidden" name="id" value={g.id}/><button className={`button small ${g.active?"danger":""}`} type="submit">{g.active?"Suspendre":"Réactiver"}</button></form></td></tr>)}</tbody></table>:<div className="empty">Aucun garage.</div>}</section>
    <h2 style={{marginTop:32}}>Demandes de démonstration</h2><section className="table-wrap">{leads.length?<table><thead><tr><th>Garage</th><th>Contact</th><th>Message</th><th>Date</th></tr></thead><tbody>{leads.map(l=><tr key={l.id}><td><strong>{l.garage_name}</strong></td><td>{l.contact_name}<br/><a href={`mailto:${l.email}`}>{l.email}</a></td><td>{l.message||"—"}</td><td>{new Intl.DateTimeFormat("fr-BE",{dateStyle:"medium"}).format(new Date(l.created_at))}</td></tr>)}</tbody></table>:<div className="empty">Aucune nouvelle demande.</div>}</section>
  </>;
}
