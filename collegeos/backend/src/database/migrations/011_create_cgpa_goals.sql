CREATE TABLE IF NOT EXISTS cgpa_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  current_cgpa NUMERIC(4,2) NOT NULL CHECK (current_cgpa >= 0 AND current_cgpa <= 10),
  target_cgpa NUMERIC(4,2) NOT NULL CHECK (target_cgpa >= 0 AND target_cgpa <= 10),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_cgpa_goals_target_not_lower CHECK (target_cgpa >= current_cgpa)
);

CREATE TRIGGER trg_cgpa_goals_set_updated_at
BEFORE UPDATE ON cgpa_goals
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
