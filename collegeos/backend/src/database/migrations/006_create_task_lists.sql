CREATE TABLE IF NOT EXISTS task_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (length(btrim(name)) > 0),
  color VARCHAR(7) NOT NULL CHECK (color ~ '^#[0-9A-Fa-f]{6}$'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_task_lists_name UNIQUE (name)
);

CREATE TRIGGER trg_task_lists_set_updated_at
BEFORE UPDATE ON task_lists
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
