CREATE TABLE IF NOT EXISTS callback_requests (
  id TEXT PRIMARY KEY NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL DEFAULT '',
  callback_date TEXT NOT NULL,
  callback_time TEXT NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'America/Chicago',
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'completed', 'cancelled')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_callback_requests_schedule
  ON callback_requests(callback_date, callback_time, status);
