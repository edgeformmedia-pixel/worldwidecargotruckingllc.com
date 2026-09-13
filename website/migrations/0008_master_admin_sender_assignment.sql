ALTER TABLE admin_users ADD COLUMN role TEXT NOT NULL DEFAULT 'employee'
  CHECK (role IN ('master', 'employee'));
ALTER TABLE admin_users ADD COLUMN sender_profile_id TEXT REFERENCES email_sender_profiles(id);

-- Preserve ownership for the first currently active administrator.
UPDATE admin_users SET role = 'master'
WHERE id = (SELECT id FROM admin_users WHERE status = 'active' ORDER BY created_at ASC LIMIT 1);

CREATE INDEX IF NOT EXISTS idx_admin_users_sender_profile ON admin_users(sender_profile_id);
