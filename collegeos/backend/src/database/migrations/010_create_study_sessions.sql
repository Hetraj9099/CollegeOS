CREATE TABLE IF NOT EXISTS study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  session_type TEXT NOT NULL CHECK (length(btrim(session_type)) > 0),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration_minutes INTEGER GENERATED ALWAYS AS (
    CASE
      WHEN end_time IS NULL THEN NULL
      ELSE GREATEST(0, FLOOR(EXTRACT(EPOCH FROM (end_time - start_time)) / 60))::INTEGER
    END
  ) STORED,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_study_sessions_time_range CHECK (end_time IS NULL OR end_time > start_time)
);

CREATE INDEX IF NOT EXISTS idx_study_sessions_start_time
  ON study_sessions (start_time);

CREATE INDEX IF NOT EXISTS idx_study_sessions_subject_id
  ON study_sessions (subject_id);
