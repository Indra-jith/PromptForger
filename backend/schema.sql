-- Sessions table: stores prompt refinement sessions
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT,
  original_prompt TEXT NOT NULL,
  refined_prompt TEXT,
  output_text TEXT,
  stages TEXT, -- JSON blob storing generator/critic/refinement stages
  model TEXT,
  latency_ms INTEGER,
  created_at TEXT DEFAULT (datetime('now')),
  feedback_prompt INTEGER DEFAULT 0,
  feedback_output INTEGER DEFAULT 0,
  feedback_comment TEXT
);

CREATE INDEX IF NOT EXISTS idx_sessions_created ON sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id, created_at DESC);

-- User preferences table (Phase 2)
CREATE TABLE IF NOT EXISTS user_prefs (
  user_id TEXT PRIMARY KEY,
  preferred_model TEXT DEFAULT 'gemini-2.0-flash',
  enable_critic BOOLEAN DEFAULT 0,
  max_tokens INTEGER DEFAULT 2048,
  theme TEXT DEFAULT 'light',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Analytics events table (optional)
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  event_name TEXT NOT NULL,
  user_id TEXT,
  properties TEXT, -- JSON blob
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_events_name_created ON events(event_name, created_at DESC);
