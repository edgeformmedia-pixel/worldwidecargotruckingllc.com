CREATE TABLE IF NOT EXISTS employee_email_access (
  admin_user_id TEXT NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  sender_profile_id TEXT NOT NULL REFERENCES email_sender_profiles(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (admin_user_id, sender_profile_id)
);

CREATE INDEX IF NOT EXISTS idx_employee_email_access_profile ON employee_email_access(sender_profile_id);

INSERT OR IGNORE INTO employee_email_access (admin_user_id, sender_profile_id)
SELECT id, sender_profile_id FROM admin_users
WHERE role = 'employee' AND sender_profile_id IS NOT NULL;
