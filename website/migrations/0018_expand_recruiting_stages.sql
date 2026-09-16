-- 0005 limited recruiting_stage to the first three stages, so steps 4-6 were rejected.
-- SQLite cannot alter a CHECK constraint, so rebuild applications with the full stage list.
-- Dropping applications cascades into driver_notes and active_drivers, so copy those rows
-- aside first and restore them after the rebuild.
PRAGMA defer_foreign_keys = true;

CREATE TABLE driver_notes_backup AS SELECT * FROM driver_notes;
CREATE TABLE active_drivers_backup AS SELECT * FROM active_drivers;

CREATE TABLE applications_new (
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
  submitted_at TEXT,
  account_id TEXT REFERENCES accounts(id),
  review_status TEXT NOT NULL DEFAULT 'new' CHECK (review_status IN ('new', 'reviewing', 'approved', 'declined')),
  cdl_document_uploaded_at TEXT,
  cdl_processing_consent_at TEXT,
  recruiting_stage TEXT NOT NULL DEFAULT 'phone_screen'
    CHECK (recruiting_stage IN ('phone_screen', 'docs_requested', 'docs_received', 'documents_processed', 'sold_hired_partner', 'callback_hired')),
  talked_to_at TEXT,
  docs_requested_at TEXT,
  medical_card_uploaded_at TEXT,
  medical_card_expiration TEXT,
  archived_at TEXT,
  sent_to TEXT NOT NULL DEFAULT '',
  sent_at TEXT,
  partner_company TEXT NOT NULL DEFAULT '',
  partner_note TEXT NOT NULL DEFAULT '',
  benefits_needed TEXT NOT NULL DEFAULT '' CHECK (benefits_needed IN ('', 'yes', 'no')),
  callback_date TEXT,
  callback_time TEXT,
  callback_completed_at TEXT,
  orientation_completed_at TEXT
);

INSERT INTO applications_new SELECT * FROM applications;
DROP TABLE applications;
ALTER TABLE applications_new RENAME TO applications;

CREATE INDEX idx_applications_updated_at ON applications(updated_at DESC);
CREATE INDEX idx_applications_status_updated ON applications(status, updated_at DESC);
CREATE INDEX idx_applications_account ON applications(account_id);
CREATE INDEX idx_applications_recruiting_pipeline ON applications(archived_at, recruiting_stage, updated_at DESC);
CREATE INDEX idx_applications_callback_appointments ON applications(recruiting_stage, callback_date, callback_time, callback_completed_at);

DELETE FROM driver_notes;
INSERT INTO driver_notes SELECT * FROM driver_notes_backup;
DELETE FROM active_drivers;
INSERT INTO active_drivers SELECT * FROM active_drivers_backup;
DROP TABLE driver_notes_backup;
DROP TABLE active_drivers_backup;
