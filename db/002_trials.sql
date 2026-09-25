ALTER TABLE garages
  ADD COLUMN IF NOT EXISTS trial_started_at timestamptz,
  ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz,
  ADD COLUMN IF NOT EXISTS subscription_status text NOT NULL DEFAULT 'TRIALING'
    CHECK (subscription_status IN ('TRIALING', 'ACTIVE', 'EXPIRED'));

UPDATE garages
SET trial_started_at = COALESCE(trial_started_at, created_at),
    trial_ends_at = COALESCE(trial_ends_at, created_at + interval '30 days')
WHERE trial_started_at IS NULL OR trial_ends_at IS NULL;
