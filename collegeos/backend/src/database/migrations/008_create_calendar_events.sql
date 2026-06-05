CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL CHECK (length(btrim(title)) > 0),
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('EXAM', 'ASSIGNMENT', 'STUDY', 'PERSONAL', 'CLASS')),
  related_task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_calendar_events_time_range CHECK (end_time > start_time)
);

CREATE INDEX IF NOT EXISTS idx_calendar_events_start_time
  ON calendar_events (start_time);

CREATE INDEX IF NOT EXISTS idx_calendar_events_event_type
  ON calendar_events (event_type);

CREATE TRIGGER trg_calendar_events_set_updated_at
BEFORE UPDATE ON calendar_events
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
