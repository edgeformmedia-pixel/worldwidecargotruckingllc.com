-- Stage 7: driver finished orientation before being added to active accounting.
ALTER TABLE applications ADD COLUMN orientation_completed_at TEXT;
