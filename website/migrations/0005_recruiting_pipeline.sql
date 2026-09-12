ALTER TABLE applications ADD COLUMN recruiting_stage TEXT NOT NULL DEFAULT 'phone_screen'
  CHECK (recruiting_stage IN ('phone_screen', 'docs_requested', 'docs_received'));
ALTER TABLE applications ADD COLUMN talked_to_at TEXT;
ALTER TABLE applications ADD COLUMN docs_requested_at TEXT;
ALTER TABLE applications ADD COLUMN medical_card_uploaded_at TEXT;
ALTER TABLE applications ADD COLUMN medical_card_expiration TEXT;
ALTER TABLE applications ADD COLUMN archived_at TEXT;
ALTER TABLE applications ADD COLUMN sent_to TEXT NOT NULL DEFAULT '';
ALTER TABLE applications ADD COLUMN sent_at TEXT;

CREATE INDEX IF NOT EXISTS idx_applications_recruiting_pipeline
  ON applications(archived_at, recruiting_stage, updated_at DESC);
