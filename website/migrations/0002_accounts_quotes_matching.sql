CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY NOT NULL,
  email TEXT NOT NULL COLLATE NOCASE UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL CHECK (role IN ('driver', 'broker', 'shipper')),
  driver_type TEXT CHECK (driver_type IS NULL OR driver_type IN ('owner_operator', 'company_driver')),
  password_salt TEXT,
  password_hash TEXT,
  password_iterations INTEGER,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE applications ADD COLUMN account_id TEXT REFERENCES accounts(id);
ALTER TABLE applications ADD COLUMN review_status TEXT NOT NULL DEFAULT 'new'
  CHECK (review_status IN ('new', 'reviewing', 'approved', 'declined'));
CREATE INDEX IF NOT EXISTS idx_applications_account ON applications(account_id);

CREATE TABLE IF NOT EXISTS quotes (
  id TEXT PRIMARY KEY NOT NULL,
  edit_token_hash TEXT NOT NULL,
  account_id TEXT REFERENCES accounts(id),
  requester_type TEXT NOT NULL CHECK (requester_type IN ('broker', 'shipper')),
  full_name TEXT NOT NULL DEFAULT '',
  company_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  mc_number TEXT NOT NULL DEFAULT '',
  reference_number TEXT NOT NULL DEFAULT '',
  pickup_city TEXT NOT NULL DEFAULT '',
  pickup_state TEXT NOT NULL DEFAULT '',
  pickup_zip TEXT NOT NULL DEFAULT '',
  pickup_date TEXT NOT NULL DEFAULT '',
  pickup_window TEXT NOT NULL DEFAULT '',
  pickup_appointment TEXT NOT NULL DEFAULT '',
  pickup_facility TEXT NOT NULL DEFAULT '',
  delivery_city TEXT NOT NULL DEFAULT '',
  delivery_state TEXT NOT NULL DEFAULT '',
  delivery_zip TEXT NOT NULL DEFAULT '',
  delivery_date TEXT NOT NULL DEFAULT '',
  delivery_window TEXT NOT NULL DEFAULT '',
  delivery_appointment TEXT NOT NULL DEFAULT '',
  delivery_facility TEXT NOT NULL DEFAULT '',
  equipment TEXT NOT NULL DEFAULT '',
  commodity TEXT NOT NULL DEFAULT '',
  total_weight TEXT NOT NULL DEFAULT '',
  piece_count TEXT NOT NULL DEFAULT '',
  dimensions TEXT NOT NULL DEFAULT '',
  stackable TEXT NOT NULL DEFAULT '',
  hazmat TEXT NOT NULL DEFAULT '',
  temperature_control TEXT NOT NULL DEFAULT '',
  temperature_range TEXT NOT NULL DEFAULT '',
  load_type TEXT NOT NULL DEFAULT '',
  special_services TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  current_step INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'new', 'reviewing', 'quoted', 'booked', 'declined')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  submitted_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_quotes_account ON quotes(account_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status_updated ON quotes(status, updated_at DESC);

CREATE TABLE IF NOT EXISTS driver_offers (
  id TEXT PRIMARY KEY NOT NULL,
  quote_id TEXT NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  driver_account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  offered_rate_cents INTEGER,
  notes TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'offered'
    CHECK (status IN ('offered', 'accepted', 'declined', 'withdrawn')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (quote_id, driver_account_id)
);

CREATE INDEX IF NOT EXISTS idx_offers_driver ON driver_offers(driver_account_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_offers_quote ON driver_offers(quote_id, updated_at DESC);
