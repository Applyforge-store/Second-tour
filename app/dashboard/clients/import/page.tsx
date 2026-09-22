import Link from "next/link";
import { importClientsAction } from "./actions";

export default async function ImportPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <><header className="page-head"><div><Link href="/dashboard/clients">← Clients</Link><h1>Importer des clients</h1><p className="muted">Le fichier reste limité à votre garage. Maximum 2 000 lignes par import.</p></div><a className="button secondary" href="/modele-clients.csv">Télécharger le modèle</a></header>
    {error && <p className="error">{error}</p>}
    <form action={importClientsAction} className="card" encType="multipart/form-data">
      <div className="field"><label htmlFor="file">Fichier CSV</label><input id="file" name="file" type="file" accept=".csv,text/csv" required /></div>
      <p className="muted">Colonnes attendues : prenom, nom, email, telephone, vehicule, immatriculation, dernier_entretien, prochain_entretien, consentement_email. Les dates utilisent le format AAAA-MM-JJ.</p>
      <button className="button" type="submit">Importer les clients</button>
    </form>
  </>;
}
