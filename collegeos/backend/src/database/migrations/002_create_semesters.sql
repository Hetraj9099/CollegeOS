CREATE TABLE IF NOT EXISTS semesters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  semester_number INTEGER NOT NULL CHECK (semester_number > 0),
  academic_year VARCHAR(9) NOT NULL CHECK (academic_year ~ '^[0-9]{4}-[0-9]{4}$'),
  total_credits NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (total_credits >= 0),
  sgpa NUMERIC(4,2) CHECK (sgpa IS NULL OR (sgpa >= 0 AND sgpa <= 10)),
  cgpa NUMERIC(4,2) CHECK (cgpa IS NULL OR (cgpa >= 0 AND cgpa <= 10)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_semesters_semester_number UNIQUE (semester_number),
  CONSTRAINT uq_semesters_academic_year UNIQUE (academic_year),
  CONSTRAINT chk_semesters_academic_year_span CHECK (
    substring(academic_year, 1, 4)::INTEGER + 1 = substring(academic_year, 6, 4)::INTEGER
  )
);

CREATE TRIGGER trg_semesters_set_updated_at
BEFORE UPDATE ON semesters
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
