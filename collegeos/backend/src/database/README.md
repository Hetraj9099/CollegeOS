# CollegeOS Database Layer

This folder contains the PostgreSQL database layer for CollegeOS.

## Stack

- PostgreSQL 16+
- Neon PostgreSQL compatible
- `pg` connection pool
- Raw SQL migrations
- TypeScript migration and seed runners

## Files

- `connection.ts`: shared PostgreSQL pool with Neon-aware SSL support
- `runMigrations.ts`: executes SQL migrations in filename order and tracks execution history
- `seed.ts`: inserts sample bootstrap data for local development
- `migrations/`: raw SQL schema migrations
- `schema/`: reserved for schema documentation snapshots
- `queries/`: reserved for reusable SQL query files
- `seeds/`: reserved for additional seed assets

## Setup

1. Ensure PostgreSQL 16+ is available.
2. Set `DATABASE_URL` in `backend/.env`.
3. Install dependencies from the repo root with `npm install`.

## Commands

Run migrations:

```bash
npm run db:migrate --workspace backend
```

Run seed data:

```bash
npm run db:seed --workspace backend
```

Default seeded master password:

```text
Hetraj_8520
```

## Tables

- `users`: single-user credential storage
- `semesters`: semester summary records
- `subjects`: subject catalog linked to semesters
- `grade_components`: grading buckets per subject
- `grades`: obtained marks per component
- `task_lists`: task grouping containers
- `tasks`: individual to-do items
- `calendar_events`: dated academic and personal events
- `timetable_entries`: weekly class schedule rows
- `study_sessions`: tracked timer/log sessions
- `cgpa_goals`: current and target CGPA planning entries

## Relationships

```text
semesters 1---* subjects
subjects 1---* grade_components
grade_components 1---* grades
task_lists 1---* tasks
tasks 1---* calendar_events (SET NULL on delete)
subjects 1---* timetable_entries
subjects 1---* study_sessions (SET NULL on delete)
tasks 1---* study_sessions (SET NULL on delete)
```

## Notes

- `pgcrypto` is enabled in the first migration for UUID generation.
- `updated_at` is maintained by a shared trigger function where applicable.
- `study_sessions.duration_minutes` is a generated column derived from `start_time` and `end_time`.
- Migrations are tracked in `migration_history` to prevent duplicate execution.
