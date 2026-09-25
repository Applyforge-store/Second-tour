import Link from "next/link";
import { requireSession } from "@/lib/auth";

export default async function SubscriptionPage() {
  const session = await requireSession();
  if (session.role !== "GARAGE_ADMIN") return null;
  return <main className="auth-shell"><section className="auth-card">
    <Link className="brand" href="/"><span className="mark">2</span>Second Tour</Link>
    <h1>Votre essai est terminé</h1>
    <p className="muted">Pour continuer à utiliser Second Tour, activez l’offre fondateur à 39 €/mois, sans engagement.</p>
    <a className="button" href="https://buy.stripe.com/8x2fZkc6e9xrbU4cph1Fe00" target="_blank" rel="noopener noreferrer">Continuer avec l’offre à 39 €/mois</a>
    <p className="muted">Besoin d’aide ? Répondez simplement à notre e-mail de contact.</p>
  </section></main>;
}
