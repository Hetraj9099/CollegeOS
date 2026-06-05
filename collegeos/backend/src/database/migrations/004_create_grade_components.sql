CREATE TABLE IF NOT EXISTS grade_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  component_name TEXT NOT NULL CHECK (length(btrim(component_name)) > 0),
  max_marks NUMERIC(6,2) NOT NULL CHECK (max_marks > 0),
  weight_percentage NUMERIC(5,2) NOT NULL CHECK (weight_percentage >= 0 AND weight_percentage <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_grade_components_subject_component UNIQUE (subject_id, component_name)
);

CREATE INDEX IF NOT EXISTS idx_grade_components_subject_id
  ON grade_components (subject_id);

CREATE OR REPLACE FUNCTION validate_grade_component_total_weight()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  target_subject_id UUID;
  total_weight NUMERIC(7,2);
BEGIN
  target_subject_id := COALESCE(NEW.subject_id, OLD.subject_id);

  SELECT COALESCE(SUM(weight_percentage), 0)
  INTO total_weight
  FROM grade_components
  WHERE subject_id = target_subject_id;

  IF total_weight > 100 THEN
    RAISE EXCEPTION 'Total weight percentage cannot exceed 100 for subject %', target_subject_id;
  END IF;

  RETURN NULL;
END;
$$;

CREATE CONSTRAINT TRIGGER trg_grade_components_total_weight
AFTER INSERT OR UPDATE OR DELETE ON grade_components
DEFERRABLE INITIALLY IMMEDIATE
FOR EACH ROW
EXECUTE FUNCTION validate_grade_component_total_weight();

CREATE TRIGGER trg_grade_components_set_updated_at
BEFORE UPDATE ON grade_components
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
