import Link from "next/link";
import { signupAction } from "./actions";

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <main className="auth-shell"><section className="auth-card">
    <Link className="brand" href="/"><span className="mark">2</span>Second Tour</Link>
    <h1>30 jours gratuits</h1>
    <p className="muted">Créez votre espace garage. Aucun paiement n’est demandé aujourd’hui.</p>
    {error && <p className="error">{error}</p>}
    <form action={signupAction}>
      <div className="field"><label htmlFor="garageName">Nom du garage</label><input id="garageName" name="garageName" required minLength={2} maxLength={120} /></div>
      <div className="field"><label htmlFor="email">E-mail professionnel</label><input id="email" name="email" type="email" autoComplete="email" required /></div>
      <div className="field"><label htmlFor="password">Mot de passe</label><input id="password" name="password" type="password" autoComplete="new-password" minLength={12} required /></div>
      <button className="button" type="submit">Créer mon espace gratuitement</button>
    </form>
    <p className="muted">Déjà inscrit ? <Link href="/login">Se connecter</Link></p>
  </section></main>;
}
