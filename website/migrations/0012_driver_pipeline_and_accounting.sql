-- Expand recruiting from three operational states to the six-stage hiring flow.
-- Existing "docs_received" records remain at stage 3.
ALTER TABLE applications ADD COLUMN partner_company TEXT NOT NULL DEFAULT '';
ALTER TABLE applications ADD COLUMN partner_note TEXT NOT NULL DEFAULT '';

CREATE TABLE IF NOT EXISTS active_drivers (
  id TEXT PRIMARY KEY NOT NULL,
  application_id TEXT NOT NULL UNIQUE REFERENCES applications(id) ON DELETE CASCADE,
  payout_cents INTEGER NOT NULL CHECK (payout_cents >= 0),
  driver_start_date TEXT NOT NULL,
  payment_delay_weeks INTEGER NOT NULL CHECK (payment_delay_weeks IN (1, 2)),
  expected_payment_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'off')),
  turned_off_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_active_drivers_status_due
  ON active_drivers(status, expected_payment_date);
