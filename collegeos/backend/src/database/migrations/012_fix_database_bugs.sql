-- Drop the overly restrictive unique constraints on semesters
ALTER TABLE semesters DROP CONSTRAINT IF EXISTS uq_semesters_academic_year;
ALTER TABLE semesters DROP CONSTRAINT IF EXISTS uq_semesters_semester_number;

-- Add a composite unique constraint allowing multiple semesters per academic year
-- but ensuring no duplicate semester numbers within the same year.
ALTER TABLE semesters ADD CONSTRAINT uq_semesters_year_number UNIQUE (academic_year, semester_number);

-- Add missing foreign key indexes for query performance optimization
CREATE INDEX IF NOT EXISTS idx_tasks_list_id ON tasks (list_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_related_task_id ON calendar_events (related_task_id);
CREATE INDEX IF NOT EXISTS idx_timetable_entries_subject_id ON timetable_entries (subject_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_task_id ON study_sessions (task_id);
