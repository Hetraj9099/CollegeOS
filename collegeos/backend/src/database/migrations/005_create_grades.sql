CREATE TABLE IF NOT EXISTS grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_id UUID NOT NULL REFERENCES grade_components(id) ON DELETE CASCADE,
  obtained_marks NUMERIC(6,2) NOT NULL CHECK (obtained_marks >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_grades_component_id UNIQUE (component_id)
);

CREATE INDEX IF NOT EXISTS idx_grades_component_id
  ON grades (component_id);

CREATE OR REPLACE FUNCTION validate_grade_obtained_marks()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  component_max_marks NUMERIC(6,2);
BEGIN
  SELECT max_marks
  INTO component_max_marks
  FROM grade_components
  WHERE id = NEW.component_id;

  IF component_max_marks IS NULL THEN
    RAISE EXCEPTION 'Grade component % does not exist', NEW.component_id;
  END IF;

  IF NEW.obtained_marks > component_max_marks THEN
    RAISE EXCEPTION 'Obtained marks cannot exceed component max marks';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_grades_validate_obtained_marks
BEFORE INSERT OR UPDATE ON grades
FOR EACH ROW
EXECUTE FUNCTION validate_grade_obtained_marks();
