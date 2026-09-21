-- Migration 0005 limited recruiting_stage to the original three pipeline stages.
-- Rebuild the table so the four newer stages can be stored as well.
PRAGMA defer_foreign_keys = ON;

CREATE TABLE applications_rebuilt (
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
  recruiting_stage TEXT NOT NULL DEFAULT 'phone_screen' CHECK (recruiting_stage IN ('phone_screen', 'docs_requested', 'docs_received', 'documents_processed', 'sold_hired_partner', 'callback_hired')),
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
  callback_completed_at TEXT
);

INSERT INTO applications_rebuilt
SELECT id, edit_token_hash, driver_type, full_name, phone, email, gender, experience,
  truck_year, truck_mileage, has_plate, amazon_relay_experience, start_availability,
  current_step, status, created_at, updated_at, submitted_at, account_id, review_status,
  cdl_document_uploaded_at, cdl_processing_consent_at, recruiting_stage, talked_to_at,
  docs_requested_at, medical_card_uploaded_at, medical_card_expiration, archived_at,
  sent_to, sent_at, partner_company, partner_note, benefits_needed, callback_date,
  callback_time, callback_completed_at
FROM applications;

DROP TABLE applications;
ALTER TABLE applications_rebuilt RENAME TO applications;

CREATE INDEX idx_applications_updated_at ON applications(updated_at DESC);
CREATE INDEX idx_applications_status_updated ON applications(status, updated_at DESC);
CREATE INDEX idx_applications_account ON applications(account_id);
CREATE INDEX idx_applications_recruiting_pipeline ON applications(archived_at, recruiting_stage, updated_at DESC);
CREATE INDEX idx_applications_callback_appointments ON applications(recruiting_stage, callback_date, callback_time, callback_completed_at);
