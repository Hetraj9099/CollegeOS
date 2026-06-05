import { db } from "../../database/connection.js";
import type { CalendarEvent, CreateCalendarEventPayload, UpdateCalendarEventPayload } from "./types.js";

export class CalendarRepository {
  async listEvents(startDate?: Date, endDate?: Date): Promise<CalendarEvent[]> {
    const params: any[] = [];
    let queryText = "SELECT * FROM calendar_events WHERE 1=1";

    if (startDate) {
      params.push(startDate);
      queryText += ` AND end_time >= $${params.length}`;
    }

    if (endDate) {
      params.push(endDate);
      queryText += ` AND start_time <= $${params.length}`;
    }

    queryText += " ORDER BY start_time ASC";

    const result = await db.query<CalendarEvent>(queryText, params);
    return result.rows;
  }

  async findById(id: string): Promise<CalendarEvent | null> {
    const result = await db.query<CalendarEvent>(
      "SELECT * FROM calendar_events WHERE id = $1",
      [id]
    );
    return result.rows[0] ?? null;
  }

  async create(payload: CreateCalendarEventPayload): Promise<CalendarEvent> {
    const result = await db.query<CalendarEvent>(
      `
      INSERT INTO calendar_events (title, description, start_time, end_time, event_type, related_task_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [
        payload.title,
        payload.description ?? null,
        new Date(payload.start_time),
        new Date(payload.end_time),
        payload.event_type,
        payload.related_task_id ?? null
      ]
    );
    return result.rows[0];
  }

  async update(id: string, payload: UpdateCalendarEventPayload): Promise<CalendarEvent | null> {
    const current = await this.findById(id);
    if (!current) return null;

    const title = payload.title ?? current.title;
    const description = payload.description === null ? null : (payload.description ?? current.description);
    const startTime = payload.start_time ? new Date(payload.start_time) : current.start_time;
    const endTime = payload.end_time ? new Date(payload.end_time) : current.end_time;
    const eventType = payload.event_type ?? current.event_type;
    const relatedTaskId = payload.related_task_id === null ? null : (payload.related_task_id ?? current.related_task_id);

    // Validate date range constraints programmatically
    if (endTime <= startTime) {
      throw new Error("End time must be after start time");
    }

    const result = await db.query<CalendarEvent>(
      `
      UPDATE calendar_events
      SET
        title = $1,
        description = $2,
        start_time = $3,
        end_time = $4,
        event_type = $5,
        related_task_id = $6,
        updated_at = NOW()
      WHERE id = $7
      RETURNING *
      `,
      [
        title,
        description,
        startTime,
        endTime,
        eventType,
        relatedTaskId,
        id
      ]
    );
    return result.rows[0] ?? null;
  }

  async delete(id: string): Promise<CalendarEvent | null> {
    const result = await db.query<CalendarEvent>(
      "DELETE FROM calendar_events WHERE id = $1 RETURNING *",
      [id]
    );
    return result.rows[0] ?? null;
  }
}
