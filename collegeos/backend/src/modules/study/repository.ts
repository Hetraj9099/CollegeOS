import { db } from "../../database/connection.js";
import type { StudySession, StartStudySessionPayload, StopStudySessionPayload, CreateStudySessionPayload } from "./types.js";

export class StudyRepository {
  async getActiveSession(): Promise<StudySession | null> {
    const result = await db.query<StudySession>(
      `
      SELECT 
        ss.*,
        s.name AS subject_name,
        s.color AS subject_color,
        t.title AS task_title
      FROM study_sessions ss
      LEFT JOIN subjects s ON s.id = ss.subject_id
      LEFT JOIN tasks t ON t.id = ss.task_id
      WHERE ss.end_time IS NULL
      `
    );
    return result.rows[0] ?? null;
  }

  async startSession(payload: StartStudySessionPayload): Promise<StudySession> {
    const result = await db.query<StudySession>(
      `
      INSERT INTO study_sessions (subject_id, task_id, session_type, start_time)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [
        payload.subject_id ?? null,
        payload.task_id ?? null,
        payload.session_type,
        new Date(payload.start_time)
      ]
    );
    return result.rows[0];
  }

  async stopSession(id: string, payload: StopStudySessionPayload): Promise<StudySession | null> {
    const result = await db.query<StudySession>(
      `
      UPDATE study_sessions
      SET 
        end_time = $1,
        notes = COALESCE($2, notes)
      WHERE id = $3
      RETURNING *
      `,
      [new Date(payload.end_time), payload.notes ?? null, id]
    );
    return result.rows[0] ?? null;
  }

  async listSessions(filters: {
    subject_id?: string;
    limit?: number;
  }): Promise<StudySession[]> {
    const params: any[] = [];
    let queryText = `
      SELECT 
        ss.*,
        s.name AS subject_name,
        s.color AS subject_color,
        t.title AS task_title
      FROM study_sessions ss
      LEFT JOIN subjects s ON s.id = ss.subject_id
      LEFT JOIN tasks t ON t.id = ss.task_id
      WHERE ss.end_time IS NOT NULL
    `;

    if (filters.subject_id) {
      params.push(filters.subject_id);
      queryText += ` AND ss.subject_id = $${params.length}`;
    }

    queryText += " ORDER BY ss.start_time DESC";

    if (filters.limit) {
      params.push(filters.limit);
      queryText += ` LIMIT $${params.length}`;
    }

    const result = await db.query<StudySession>(queryText, params);
    return result.rows;
  }

  async createSession(payload: CreateStudySessionPayload): Promise<StudySession> {
    const result = await db.query<StudySession>(
      `
      INSERT INTO study_sessions (subject_id, task_id, session_type, start_time, end_time, notes)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [
        payload.subject_id ?? null,
        payload.task_id ?? null,
        payload.session_type,
        new Date(payload.start_time),
        new Date(payload.end_time),
        payload.notes ?? null
      ]
    );
    return result.rows[0];
  }

  async deleteSession(id: string): Promise<StudySession | null> {
    const result = await db.query<StudySession>(
      "DELETE FROM study_sessions WHERE id = $1 RETURNING *",
      [id]
    );
    return result.rows[0] ?? null;
  }

  // Fetch daily study minutes ordered by day to calculate streaks dynamically
  async getDailyStudyMinutes(timezoneOffsetMinutes: number = 0): Promise<{ study_date: string; total_minutes: number }[]> {
    // We compute dates adjusted by the user's timezone offset
    const result = await db.query<{ study_date: string; total_minutes: string }>(
      `
      SELECT 
        ((start_time - INTERVAL '1 minute' * $1)::date)::text AS study_date,
        SUM(duration_minutes)::integer AS total_minutes
      FROM study_sessions
      WHERE end_time IS NOT NULL AND duration_minutes IS NOT NULL
      GROUP BY study_date
      ORDER BY study_date ASC
      `,
      [timezoneOffsetMinutes]
    );
    return result.rows.map(row => ({
      study_date: row.study_date,
      total_minutes: Number(row.total_minutes)
    }));
  }

  async getTotalStudyTime(): Promise<number> {
    const result = await db.query<{ sum: string }>(
      "SELECT SUM(duration_minutes)::integer AS sum FROM study_sessions WHERE end_time IS NOT NULL"
    );
    return Number(result.rows[0]?.sum ?? 0);
  }
}
