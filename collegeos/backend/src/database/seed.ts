import { closeDatabaseConnection, db } from "./connection.js";

async function seed() {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const semesterResult = await client.query<{ id: string }>(
      `
      INSERT INTO semesters (
        semester_number,
        academic_year,
        total_credits,
        sgpa,
        cgpa
      )
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (academic_year, semester_number) DO UPDATE
      SET
        academic_year = EXCLUDED.academic_year,
        total_credits = EXCLUDED.total_credits,
        sgpa = EXCLUDED.sgpa,
        cgpa = EXCLUDED.cgpa,
        updated_at = NOW()
      RETURNING id
      `,
      [1, "2025-2026", 20, 8.4, 8.4]
    );
    const semesterId = semesterResult.rows[0].id;

    const physicsResult = await client.query<{ id: string }>(
      `
      INSERT INTO subjects (
        semester_id,
        name,
        course_code,
        credits,
        color
      )
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (semester_id, course_code) DO UPDATE
      SET
        name = EXCLUDED.name,
        credits = EXCLUDED.credits,
        color = EXCLUDED.color,
        updated_at = NOW()
      RETURNING id
      `,
      [semesterId, "Physics", "PHY101", 4, "#2563EB"]
    );
    const physicsId = physicsResult.rows[0].id;

    await client.query(
      `
      INSERT INTO subjects (
        semester_id,
        name,
        course_code,
        credits,
        color
      )
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (semester_id, course_code) DO UPDATE
      SET
        name = EXCLUDED.name,
        credits = EXCLUDED.credits,
        color = EXCLUDED.color,
        updated_at = NOW()
      `,
      [semesterId, "Mathematics", "MTH101", 4, "#059669"]
    );

    const taskListResult = await client.query<{ id: string }>(
      `
      INSERT INTO task_lists (name, color)
      VALUES ($1, $2)
      ON CONFLICT (name) DO UPDATE
      SET
        color = EXCLUDED.color,
        updated_at = NOW()
      RETURNING id
      `,
      ["Semester Tasks", "#F59E0B"]
    );
    const taskListId = taskListResult.rows[0].id;

    const existingTaskResult = await client.query<{ id: string }>(
      `
      SELECT id
      FROM tasks
      WHERE list_id = $1 AND title = $2
      LIMIT 1
      `,
      [taskListId, "Complete Physics Assignment"]
    );
    const taskId =
      existingTaskResult.rows[0]?.id ??
      (
        await client.query<{ id: string }>(
          `
          INSERT INTO tasks (
            list_id,
            title,
            description,
            priority,
            status,
            due_date,
            completed,
            completed_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING id
          `,
          [
            taskListId,
            "Complete Physics Assignment",
            "Initial sample task created by the seed script.",
            "HIGH",
            "TODO",
            "2025-08-15T18:00:00Z",
            false,
            null
          ]
        )
      ).rows[0].id;

    const existingCalendarEventResult = await client.query<{ id: string }>(
      `
      SELECT id
      FROM calendar_events
      WHERE title = $1 AND start_time = $2
      LIMIT 1
      `,
      ["Physics Assignment Session", "2025-08-14T10:00:00Z"]
    );

    if (!existingCalendarEventResult.rows[0]) {
      await client.query(
        `
        INSERT INTO calendar_events (
          title,
          description,
          start_time,
          end_time,
          event_type,
          related_task_id
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        `,
        [
          "Physics Assignment Session",
          "Example seeded calendar event.",
          "2025-08-14T10:00:00Z",
          "2025-08-14T11:30:00Z",
          "ASSIGNMENT",
          taskId
        ]
      );
    }

    const existingStudySessionResult = await client.query<{ id: string }>(
      `
      SELECT id
      FROM study_sessions
      WHERE session_type = $1 AND start_time = $2
      LIMIT 1
      `,
      ["REVISION", "2025-08-13T09:00:00Z"]
    );

    if (!existingStudySessionResult.rows[0]) {
      await client.query(
        `
        INSERT INTO study_sessions (
          subject_id,
          task_id,
          session_type,
          start_time,
          end_time,
          notes
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        `,
        [
          physicsId,
          taskId,
          "REVISION",
          "2025-08-13T09:00:00Z",
          "2025-08-13T10:00:00Z",
          "Sample seeded study session."
        ]
      );
    }

    const existingGoalResult = await client.query<{ id: string }>(
      `
      SELECT id
      FROM cgpa_goals
      WHERE current_cgpa = $1 AND target_cgpa = $2
      LIMIT 1
      `,
      [8.4, 9.0]
    );

    if (!existingGoalResult.rows[0]) {
      await client.query(
        `
        INSERT INTO cgpa_goals (current_cgpa, target_cgpa)
        VALUES ($1, $2)
        `,
        [8.4, 9.0]
      );
    }

    await client.query("COMMIT");
    console.log("Seed completed successfully.");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

seed()
  .then(async () => {
    await closeDatabaseConnection();
  })
  .catch(async (error) => {
    console.error("Seed failed.", error);
    await closeDatabaseConnection();
    process.exitCode = 1;
  });
