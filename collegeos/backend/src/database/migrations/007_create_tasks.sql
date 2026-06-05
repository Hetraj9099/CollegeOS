CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID NOT NULL REFERENCES task_lists(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (length(btrim(title)) > 0),
  description TEXT,
  priority TEXT NOT NULL CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH')),
  status TEXT NOT NULL CHECK (status IN ('TODO', 'IN_PROGRESS', 'DONE')),
  due_date TIMESTAMPTZ,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_tasks_completion_state CHECK (
    (completed = TRUE AND status = 'DONE' AND completed_at IS NOT NULL)
    OR
    (completed = FALSE AND status IN ('TODO', 'IN_PROGRESS') AND completed_at IS NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_tasks_due_date
  ON tasks (due_date);

CREATE INDEX IF NOT EXISTS idx_tasks_completed
  ON tasks (completed);

CREATE INDEX IF NOT EXISTS idx_tasks_status
  ON tasks (status);

CREATE TRIGGER trg_tasks_set_updated_at
BEFORE UPDATE ON tasks
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
