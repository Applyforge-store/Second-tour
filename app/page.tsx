import Link from "next/link";

export default function Home() {
  return <main className="landing">
    <nav className="nav">
      <Link className="brand" href="/"><span className="mark">2</span>Second Tour</Link>
      <div className="navlinks"><Link href="/login">Connexion garage</Link><Link className="button small" href="/demande">Demander une démo</Link></div>
    </nav>
    <section className="hero">
      <div>
        <div className="eyebrow">Pour les garages indépendants</div>
        <h1>Vos clients reviennent au bon moment.</h1>
        <p>Second Tour prépare et envoie les rappels d’entretien aux clients qui ont donné leur accord. Votre garage garde la main sur les dates, le message et l’historique.</p>
        <div className="hero-actions">
          <Link className="button" href="/inscription">Essayer gratuitement pendant 30 jours</Link>
          <Link className="button secondary" href="/login">Ouvrir mon espace</Link>
        </div>
        <p className="muted">30 jours gratuits, puis 39 €/mois sans engagement. Aucun message n’est envoyé sans consentement enregistré.</p>
      </div>
      <div className="preview-card" aria-label="Aperçu du tableau de bord">
        <small>Cette semaine</small>
        <div className="stat"><span>Rappels à envoyer</span><strong>12</strong></div>
        <div className="stat"><span>Envoyés</span><strong>38</strong></div>
        <div className="stat"><span>Clients suivis</span><strong>214</strong></div>
      </div>
    </section>
    <section className="steps">
      <article className="step"><b>01</b><h2>Ajoutez vos clients</h2><p>Un par un ou depuis un fichier CSV. Le consentement e-mail est enregistré pour chaque client.</p></article>
      <article className="step"><b>02</b><h2>Choisissez l’échéance</h2><p>Indiquez le prochain entretien. Second Tour prépare automatiquement le bon rappel.</p></article>
      <article className="step"><b>03</b><h2>Suivez chaque envoi</h2><p>Messages envoyés, en attente ou en erreur : l’historique reste visible dans votre espace.</p></article>
    </section>
  </main>;
}
