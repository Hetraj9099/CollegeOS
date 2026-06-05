import { db } from "../../database/connection.js";
import type { TimetableEntry, CreateTimetableEntryPayload, UpdateTimetableEntryPayload } from "./types.js";

export class TimetableRepository {
  async listEntries(dayOfWeek?: number): Promise<TimetableEntry[]> {
    const params: any[] = [];
    let queryText = `
      SELECT 
        te.*,
        s.name AS subject_name,
        s.color AS subject_color
      FROM timetable_entries te
      JOIN subjects s ON s.id = te.subject_id
    `;

    if (dayOfWeek !== undefined) {
      params.push(dayOfWeek);
      queryText += ` WHERE te.day_of_week = $${params.length}`;
    }

    queryText += " ORDER BY te.day_of_week ASC, te.start_time ASC";

    const result = await db.query<TimetableEntry>(queryText, params);
    return result.rows;
  }

  async findById(id: string): Promise<TimetableEntry | null> {
    const result = await db.query<TimetableEntry>(
      `
      SELECT 
        te.*,
        s.name AS subject_name,
        s.color AS subject_color
      FROM timetable_entries te
      JOIN subjects s ON s.id = te.subject_id
      WHERE te.id = $1
      `,
      [id]
    );
    return result.rows[0] ?? null;
  }

  async create(payload: CreateTimetableEntryPayload): Promise<TimetableEntry> {
    const insertResult = await db.query<{ id: string }>(
      `
      INSERT INTO timetable_entries (subject_id, day_of_week, start_time, end_time, classroom)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
      `,
      [
        payload.subject_id,
        payload.day_of_week,
        payload.start_time,
        payload.end_time,
        payload.classroom ?? null
      ]
    );
    
    const id = insertResult.rows[0].id;
    const entry = await this.findById(id);
    if (!entry) {
      throw new Error("Failed to retrieve newly created timetable entry");
    }
    return entry;
  }

  async update(id: string, payload: UpdateTimetableEntryPayload): Promise<TimetableEntry | null> {
    const current = await this.findById(id);
    if (!current) return null;

    const subjectId = payload.subject_id ?? current.subject_id;
    const dayOfWeek = payload.day_of_week ?? current.day_of_week;
    const startTime = payload.start_time ?? current.start_time;
    const endTime = payload.end_time ?? current.end_time;
    const classroom = payload.classroom === null ? null : (payload.classroom ?? current.classroom);

    if (endTime <= startTime) {
      throw new Error("End time must be after start time");
    }

    await db.query(
      `
      UPDATE timetable_entries
      SET
        subject_id = $1,
        day_of_week = $2,
        start_time = $3,
        end_time = $4,
        classroom = $5,
        updated_at = NOW()
      WHERE id = $6
      `,
      [
        subjectId,
        dayOfWeek,
        startTime,
        endTime,
        classroom,
        id
      ]
    );

    return this.findById(id);
  }

  async delete(id: string): Promise<TimetableEntry | null> {
    const current = await this.findById(id);
    if (!current) return null;

    await db.query("DELETE FROM timetable_entries WHERE id = $1", [id]);
    return current;
  }
}
