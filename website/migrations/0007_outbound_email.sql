CREATE TABLE IF NOT EXISTS email_sender_profiles (
  id TEXT PRIMARY KEY NOT NULL,
  label TEXT NOT NULL,
  display_name TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO email_sender_profiles (id, label, display_name) VALUES
  ('general', 'Worldwide Cargo Express', 'Worldwide Cargo Express'),
  ('recruiting', 'Worldwide Cargo Express — Recruiting', 'Worldwide Cargo Express Recruiting');

CREATE TABLE IF NOT EXISTS email_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  default_sender_profile_id TEXT NOT NULL REFERENCES email_sender_profiles(id),
  default_reply_to TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO email_settings (id, default_sender_profile_id) VALUES (1, 'general');

CREATE TABLE IF NOT EXISTS outbound_emails (
  id TEXT PRIMARY KEY NOT NULL,
  admin_user_id TEXT REFERENCES admin_users(id) ON DELETE SET NULL,
  sender_profile_id TEXT REFERENCES email_sender_profiles(id) ON DELETE SET NULL,
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  reply_to TEXT NOT NULL DEFAULT '',
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  body_text TEXT NOT NULL,
  provider_message_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('sent', 'failed')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_outbound_emails_created ON outbound_emails(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_outbound_emails_admin ON outbound_emails(admin_user_id, created_at DESC);
