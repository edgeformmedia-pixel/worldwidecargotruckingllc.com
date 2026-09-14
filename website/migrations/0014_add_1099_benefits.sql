-- Record whether an applicant wants a benefits specialist to follow up.
ALTER TABLE applications ADD COLUMN benefits_needed TEXT NOT NULL DEFAULT ''
  CHECK (benefits_needed IN ('', 'yes', 'no'));
