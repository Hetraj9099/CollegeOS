-- Add subject_id column to tasks table
ALTER TABLE tasks ADD COLUMN subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL;

-- Create index on subject_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_tasks_subject_id ON tasks (subject_id);
