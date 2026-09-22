import Link from "next/link";
import { loginAction } from "./actions";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <main className="auth-shell"><section className="auth-card">
    <Link className="brand" href="/"><span className="mark">2</span>Second Tour</Link>
    <h1>Connexion</h1><p className="muted">Accédez aux clients et aux rappels de votre garage.</p>
    {error && <p className="error">{error}</p>}
    <form action={loginAction}>
      <div className="field"><label htmlFor="email">Adresse e-mail</label><input id="email" name="email" type="email" autoComplete="email" required /></div>
      <div className="field"><label htmlFor="password">Mot de passe</label><input id="password" name="password" type="password" autoComplete="current-password" required /></div>
      <button className="button" type="submit">Se connecter</button>
    </form>
  </section></main>;
}
