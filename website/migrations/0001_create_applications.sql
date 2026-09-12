CREATE TABLE IF NOT EXISTS applications (
  id TEXT PRIMARY KEY NOT NULL,
  edit_token_hash TEXT NOT NULL,
  driver_type TEXT NOT NULL CHECK (driver_type IN ('owner_operator', 'company_driver')),
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  gender TEXT NOT NULL DEFAULT '',
  experience TEXT NOT NULL DEFAULT '',
  truck_year TEXT NOT NULL DEFAULT '',
  truck_mileage TEXT NOT NULL DEFAULT '',
  has_plate TEXT NOT NULL DEFAULT '',
  amazon_relay_experience TEXT NOT NULL DEFAULT '',
  start_availability TEXT NOT NULL DEFAULT '',
  current_step INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  submitted_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_applications_updated_at ON applications(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_applications_status_updated ON applications(status, updated_at DESC);
