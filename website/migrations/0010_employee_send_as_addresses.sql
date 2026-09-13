ALTER TABLE email_sender_profiles ADD COLUMN sender_email TEXT NOT NULL DEFAULT 'no-reply@worldwidecargoexpressllc.com';

UPDATE email_sender_profiles SET sender_email = 'dispatch@worldwidecargoexpressllc.com' WHERE id = 'general';
UPDATE email_sender_profiles SET sender_email = 'support@worldwidecargoexpressllc.com' WHERE id = 'recruiting';

INSERT INTO email_sender_profiles (id, label, display_name, sender_email, active)
SELECT 'employee-' || id, full_name, full_name, 'no-reply@worldwidecargoexpressllc.com', 1
FROM admin_users
WHERE sender_profile_id IS NULL;

UPDATE admin_users SET sender_profile_id = 'employee-' || id WHERE sender_profile_id IS NULL;
