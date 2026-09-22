CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS garages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  contact_email text NOT NULL,
  timezone text NOT NULL DEFAULT 'Europe/Brussels',
  reminder_days_before integer NOT NULL DEFAULT 14 CHECK (reminder_days_before BETWEEN 0 AND 120),
  email_subject text NOT NULL DEFAULT 'Votre prochain entretien approche',
  email_template text NOT NULL DEFAULT 'Bonjour {{prenom}},\n\nVotre {{vehicule}} arrive à la date prévue pour son prochain entretien. Répondez à cet e-mail pour choisir un rendez-vous.\n\nÀ bientôt,\n{{garage}}',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  garage_id uuid REFERENCES garages(id) ON DELETE CASCADE,
  email text NOT NULL,
  password_hash text NOT NULL,
  role text NOT NULL CHECK (role IN ('SUPER_ADMIN', 'GARAGE_ADMIN')),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_login_at timestamptz
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_lower ON users (lower(email));
CREATE INDEX IF NOT EXISTS idx_users_garage_id ON users (garage_id);

CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  garage_id uuid NOT NULL REFERENCES garages(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL DEFAULT '',
  email text NOT NULL,
  phone text NOT NULL DEFAULT '',
  vehicle text NOT NULL,
  plate text NOT NULL DEFAULT '',
  last_service_date date,
  next_service_date date NOT NULL,
  email_consent boolean NOT NULL DEFAULT false,
  consent_recorded_at timestamptz,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_clients_garage_active ON clients (garage_id, active);
CREATE INDEX IF NOT EXISTS idx_clients_next_service ON clients (garage_id, next_service_date) WHERE active = true;

CREATE TABLE IF NOT EXISTS reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  garage_id uuid NOT NULL REFERENCES garages(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  due_at timestamptz NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SENT', 'FAILED', 'SKIPPED')),
  sent_at timestamptz,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_reminders_once_per_due_date ON reminders (garage_id, client_id, due_at);
CREATE INDEX IF NOT EXISTS idx_reminders_due_status ON reminders (status, due_at);
CREATE INDEX IF NOT EXISTS idx_reminders_garage_created ON reminders (garage_id, created_at DESC);

CREATE TABLE IF NOT EXISTS audit_logs (
  id bigserial PRIMARY KEY,
  garage_id uuid REFERENCES garages(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_garage_created ON audit_logs (garage_id, created_at DESC);

CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  garage_name text NOT NULL,
  contact_name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW', 'CONTACTED', 'CLOSED')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_leads_status_created ON leads (status, created_at DESC);
