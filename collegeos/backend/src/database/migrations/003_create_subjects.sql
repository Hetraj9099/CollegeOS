CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  semester_id UUID NOT NULL REFERENCES semesters(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (length(btrim(name)) > 0),
  course_code TEXT NOT NULL CHECK (length(btrim(course_code)) > 0),
  credits NUMERIC(5,2) NOT NULL CHECK (credits > 0),
  color VARCHAR(7) NOT NULL CHECK (color ~ '^#[0-9A-Fa-f]{6}$'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_subjects_semester_course_code UNIQUE (semester_id, course_code)
);

CREATE INDEX IF NOT EXISTS idx_subjects_semester_id
  ON subjects (semester_id);

CREATE TRIGGER trg_subjects_set_updated_at
BEFORE UPDATE ON subjects
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
