import { requireGarageAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";
import { changePasswordAction, updateSettingsAction } from "./actions";

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ success?: string; error?: string }> }) {
  const session = await requireGarageAdmin(); const query = await searchParams;
  const [garage] = await sql<{ name:string; contact_email:string; reminder_days_before:number; email_subject:string; email_template:string }[]>`SELECT name,contact_email,reminder_days_before,email_subject,email_template FROM garages WHERE id=${session.garageId}`;
  return <><header className="page-head"><div><h1>Réglages</h1><p className="muted">Personnalisez le moment et le contenu des rappels.</p></div></header>
    {query.success && <p className="success">{query.success}</p>}{query.error && <p className="error">{query.error}</p>}
    <form action={updateSettingsAction} className="card">
      <div className="grid-two"><div className="field"><label>Garage</label><input value={garage.name} disabled /></div><div className="field"><label htmlFor="contactEmail">Adresse de réponse</label><input id="contactEmail" name="contactEmail" type="email" defaultValue={garage.contact_email} required /></div></div>
      <div className="field"><label htmlFor="reminderDays">Envoyer combien de jours avant l’entretien ?</label><input id="reminderDays" name="reminderDays" type="number" min="0" max="120" defaultValue={garage.reminder_days_before} required /></div>
      <div className="field"><label htmlFor="subject">Objet de l’e-mail</label><input id="subject" name="subject" defaultValue={garage.email_subject} required /></div>
      <div className="field"><label htmlFor="template">Message</label><textarea id="template" name="template" defaultValue={garage.email_template} required /><span className="muted">Variables disponibles : {"{{prenom}}"}, {"{{vehicule}}"}, {"{{date}}"}, {"{{garage}}"}.</span></div>
      <button className="button" type="submit">Enregistrer</button>
    </form>
    <form action={changePasswordAction} className="card" style={{marginTop:20}}><h2>Sécurité du compte</h2><div className="grid-two"><div className="field"><label htmlFor="currentPassword">Mot de passe actuel</label><input id="currentPassword" name="currentPassword" type="password" autoComplete="current-password" required/></div><div className="field"><label htmlFor="newPassword">Nouveau mot de passe</label><input id="newPassword" name="newPassword" type="password" minLength={12} autoComplete="new-password" required/></div></div><button className="button secondary" type="submit">Modifier le mot de passe</button></form>
  </>;
}
