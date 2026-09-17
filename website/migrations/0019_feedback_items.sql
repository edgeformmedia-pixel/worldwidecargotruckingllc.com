-- Shared bugs & suggestions board for every admin user.
CREATE TABLE IF NOT EXISTS feedback_items (
  id TEXT PRIMARY KEY NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('bug', 'suggestion')),
  title TEXT NOT NULL CHECK (length(title) BETWEEN 1 AND 160),
  body TEXT NOT NULL DEFAULT '' CHECK (length(body) <= 4000),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed')),
  created_by TEXT REFERENCES admin_users(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  resolution_note TEXT NOT NULL DEFAULT '',
  completed_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_feedback_items_status_created
  ON feedback_items(status, created_at DESC);
