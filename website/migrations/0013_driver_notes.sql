-- Keep an append-only note history for every driver application.
CREATE TABLE IF NOT EXISTS driver_notes (
  id TEXT PRIMARY KEY NOT NULL,
  application_id TEXT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  admin_user_id TEXT REFERENCES admin_users(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  body TEXT NOT NULL CHECK (length(body) BETWEEN 1 AND 4000),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_driver_notes_application_created
  ON driver_notes(application_id, created_at DESC);
