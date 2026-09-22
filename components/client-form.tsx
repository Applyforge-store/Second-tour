type ClientValues = {
  first_name?: string; last_name?: string; email?: string; phone?: string; vehicle?: string; plate?: string;
  last_service_date?: string | null; next_service_date?: string; email_consent?: boolean;
};

export function ClientForm({ action, values = {}, submitLabel }: { action: (formData: FormData) => void | Promise<void>; values?: ClientValues; submitLabel: string }) {
  return <form action={action} className="card">
    <div className="grid-two">
      <div className="field"><label htmlFor="firstName">Prénom *</label><input id="firstName" name="firstName" defaultValue={values.first_name} required /></div>
      <div className="field"><label htmlFor="lastName">Nom</label><input id="lastName" name="lastName" defaultValue={values.last_name} /></div>
      <div className="field"><label htmlFor="email">E-mail *</label><input id="email" name="email" type="email" defaultValue={values.email} required /></div>
      <div className="field"><label htmlFor="phone">Téléphone</label><input id="phone" name="phone" defaultValue={values.phone} /></div>
      <div className="field"><label htmlFor="vehicle">Véhicule *</label><input id="vehicle" name="vehicle" placeholder="Peugeot 208" defaultValue={values.vehicle} required /></div>
      <div className="field"><label htmlFor="plate">Immatriculation</label><input id="plate" name="plate" defaultValue={values.plate} /></div>
      <div className="field"><label htmlFor="lastServiceDate">Dernier entretien</label><input id="lastServiceDate" name="lastServiceDate" type="date" defaultValue={values.last_service_date ?? ""} /></div>
      <div className="field"><label htmlFor="nextServiceDate">Prochain entretien *</label><input id="nextServiceDate" name="nextServiceDate" type="date" defaultValue={values.next_service_date} required /></div>
    </div>
    <label className="checkbox"><input name="emailConsent" type="checkbox" defaultChecked={values.email_consent} /><span><strong>Consentement e-mail enregistré</strong><br /><span className="muted">Le garage confirme que ce client a accepté de recevoir des rappels d’entretien.</span></span></label>
    <button className="button" type="submit">{submitLabel}</button>
  </form>;
}
