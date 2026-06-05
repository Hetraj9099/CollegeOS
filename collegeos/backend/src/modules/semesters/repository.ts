import { db } from "../../database/connection.js";
import type { Semester, CreateSemesterPayload } from "./types.js";

export class SemestersRepository {
  async list() {
    const result = await db.query<Semester>(
      "SELECT * FROM semesters ORDER BY semester_number ASC"
    );
    return result.rows;
  }

  async findById(id: string) {
    const result = await db.query<Semester>("SELECT * FROM semesters WHERE id = $1", [id]);
    return result.rows[0] ?? null;
  }

  async create(payload: CreateSemesterPayload) {
    const result = await db.query<Semester>(
      `
      INSERT INTO semesters (semester_number, academic_year, total_credits, sgpa, cgpa)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [
        payload.semester_number,
        payload.academic_year,
        payload.total_credits,
        payload.sgpa ?? null,
        payload.cgpa ?? null
      ]
    );
    return result.rows[0];
  }

  async update(id: string, payload: Partial<CreateSemesterPayload>) {
    const result = await db.query<Semester>(
      `
      UPDATE semesters
      SET
        semester_number = COALESCE($1, semester_number),
        academic_year = COALESCE($2, academic_year),
        total_credits = COALESCE($3, total_credits),
        sgpa = COALESCE($4, sgpa),
        cgpa = COALESCE($5, cgpa),
        updated_at = NOW()
      WHERE id = $6
      RETURNING *
      `,
      [
        payload.semester_number ?? null,
        payload.academic_year ?? null,
        payload.total_credits ?? null,
        payload.sgpa ?? null,
        payload.cgpa ?? null,
        id
      ]
    );
    return result.rows[0] ?? null;
  }

  async delete(id: string) {
    const result = await db.query<Semester>("DELETE FROM semesters WHERE id = $1 RETURNING *", [id]);
    return result.rows[0] ?? null;
  }
}
