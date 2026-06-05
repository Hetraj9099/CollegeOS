CREATE TABLE IF NOT EXISTS timetable_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  classroom TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_timetable_entries_time_range CHECK (end_time > start_time)
);

CREATE INDEX IF NOT EXISTS idx_timetable_entries_day_of_week
  ON timetable_entries (day_of_week);

CREATE TRIGGER trg_timetable_entries_set_updated_at
BEFORE UPDATE ON timetable_entries
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
