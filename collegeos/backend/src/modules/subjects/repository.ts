import { db } from "../../database/connection.js";
import type { Subject, CreateSubjectPayload } from "./types.js";

export class SubjectsRepository {
  async list(semesterId?: string) {
    if (semesterId) {
      const result = await db.query<Subject>(
        "SELECT * FROM subjects WHERE semester_id = $1::uuid ORDER BY name ASC",
        [semesterId]
      );
      return result.rows;
    }
    const result = await db.query<Subject>("SELECT * FROM subjects ORDER BY name ASC");
    return result.rows;
  }

  async findById(id: string) {
    const result = await db.query<Subject>("SELECT * FROM subjects WHERE id = $1::uuid", [id]);
    return result.rows[0] ?? null;
  }

  async create(payload: CreateSubjectPayload) {
    const result = await db.query<Subject>(
      `
      INSERT INTO subjects (semester_id, name, course_code, credits, color, course_type)
      VALUES ($1::uuid, $2, $3, $4::numeric, $5, $6)
      RETURNING *
      `,
      [
        payload.semester_id,
        payload.name,
        payload.course_code,
        payload.credits,
        payload.color,
        payload.course_type
      ]
    );
    return result.rows[0];
  }

  async update(id: string, payload: Partial<CreateSubjectPayload>) {
    const result = await db.query<Subject>(
      `
      UPDATE subjects
      SET
        semester_id = COALESCE($1::uuid, semester_id),
        name = COALESCE($2::text, name),
        course_code = COALESCE($3::text, course_code),
        credits = COALESCE($4::numeric, credits),
        color = COALESCE($5::text, color),
        course_type = COALESCE($6::text, course_type),
        updated_at = NOW()
      WHERE id = $7::uuid
      RETURNING *
      `,
      [
        payload.semester_id ?? null,
        payload.name ?? null,
        payload.course_code ?? null,
        payload.credits ?? null,
        payload.color ?? null,
        payload.course_type ?? null,
        id
      ]
    );
    return result.rows[0] ?? null;
  }

  async delete(id: string) {
    const result = await db.query<Subject>("DELETE FROM subjects WHERE id = $1::uuid RETURNING *", [id]);
    return result.rows[0] ?? null;
  }
}
