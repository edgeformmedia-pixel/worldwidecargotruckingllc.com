ALTER TABLE applications ADD COLUMN callback_date TEXT;
ALTER TABLE applications ADD COLUMN callback_time TEXT;
ALTER TABLE applications ADD COLUMN callback_completed_at TEXT;

CREATE INDEX IF NOT EXISTS idx_applications_callback_appointments
  ON applications(recruiting_stage, callback_date, callback_time, callback_completed_at);
