ALTER TABLE applications ADD COLUMN referred_at TEXT;
CREATE INDEX IF NOT EXISTS idx_applications_referred_at ON applications(referred_at, updated_at DESC);
