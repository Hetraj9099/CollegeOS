import { db } from "../../database/connection.js";
import type { StudyTrendPoint, SubjectAllocationPoint, GpaTrendPoint, ProductivitySummary } from "./types.js";

export class AnalyticsRepository {
  async getStudyTrends(timezoneOffsetMinutes: number = 0): Promise<StudyTrendPoint[]> {
    // Aggregates study time for the last 30 days
    const result = await db.query<{ date: string; minutes: string }>(
      `
      SELECT 
        ((start_time - INTERVAL '1 minute' * $1)::date)::text AS date,
        SUM(duration_minutes)::integer AS minutes
      FROM study_sessions
      WHERE end_time IS NOT NULL AND duration_minutes IS NOT NULL
        AND start_time >= NOW() - INTERVAL '30 days'
      GROUP BY date
      ORDER BY date ASC
      `,
      [timezoneOffsetMinutes]
    );

    return result.rows.map(row => ({
      date: row.date,
      minutes: Number(row.minutes)
    }));
  }

  async getSubjectAllocations(): Promise<SubjectAllocationPoint[]> {
    const result = await db.query<{
      subject_id: string;
      subject_name: string;
      subject_color: string;
      minutes: string;
    }>(
      `
      SELECT 
        ss.subject_id,
        s.name AS subject_name,
        s.color AS subject_color,
        SUM(ss.duration_minutes)::integer AS minutes
      FROM study_sessions ss
      JOIN subjects s ON s.id = ss.subject_id
      WHERE ss.end_time IS NOT NULL AND ss.duration_minutes IS NOT NULL
      GROUP BY ss.subject_id, s.name, s.color
      ORDER BY minutes DESC
      `
    );

    const totalMinutes = result.rows.reduce((acc, row) => acc + Number(row.minutes), 0);

    return result.rows.map(row => {
      const minutes = Number(row.minutes);
      return {
        subject_id: row.subject_id,
        subject_name: row.subject_name,
        subject_color: row.subject_color,
        minutes,
        percentage: totalMinutes > 0 ? Number(((minutes / totalMinutes) * 100).toFixed(1)) : 0
      };
    });
  }

  async getGpaTrends(): Promise<GpaTrendPoint[]> {
    const result = await db.query<{
      semester_id: string;
      semester_number: number;
      academic_year: string;
      sgpa: string | null;
      cgpa: string | null;
    }>(
      `
      SELECT 
        id AS semester_id,
        semester_number,
        academic_year,
        sgpa::text AS sgpa,
        cgpa::text AS cgpa
      FROM semesters
      ORDER BY academic_year ASC, semester_number ASC
      `
    );

    return result.rows.map(row => ({
      semester_id: row.semester_id,
      semester_number: Number(row.semester_number),
      academic_year: row.academic_year,
      sgpa: row.sgpa !== null ? Number(row.sgpa) : null,
      cgpa: row.cgpa !== null ? Number(row.cgpa) : null
    }));
  }

  async getProductivitySummary(timezoneOffsetMinutes: number = 0): Promise<ProductivitySummary> {
    const totalTimeResult = await db.query<{ sum: string; count: string; avg: string }>(
      `
      SELECT 
        COALESCE(SUM(duration_minutes), 0)::integer AS sum,
        COUNT(*)::integer AS count,
        COALESCE(AVG(duration_minutes), 0)::integer AS avg
      FROM study_sessions
      WHERE end_time IS NOT NULL AND duration_minutes IS NOT NULL
      `
    );

    const highestDailyResult = await db.query<{ max_minutes: string }>(
      `
      SELECT COALESCE(MAX(total_minutes), 0)::integer AS max_minutes
      FROM (
        SELECT 
          ((start_time - INTERVAL '1 minute' * $1)::date)::text AS study_date,
          SUM(duration_minutes) AS total_minutes
        FROM study_sessions
        WHERE end_time IS NOT NULL AND duration_minutes IS NOT NULL
        GROUP BY study_date
      ) daily_totals
      `,
      [timezoneOffsetMinutes]
    );

    return {
      total_study_time_minutes: Number(totalTimeResult.rows[0]?.sum ?? 0),
      average_session_minutes: Number(totalTimeResult.rows[0]?.avg ?? 0),
      total_sessions_completed: Number(totalTimeResult.rows[0]?.count ?? 0),
      highest_daily_study_minutes: Number(highestDailyResult.rows[0]?.max_minutes ?? 0)
    };
  }
}
