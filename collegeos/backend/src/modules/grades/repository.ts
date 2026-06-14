import { db } from "../../database/connection.js";
import type {
  GradeComponent,
  Grade,
  CreateGradeComponentPayload,
  RecordGradePayload
} from "./types.js";

export class GradesRepository {
  // --- Grade Components ---
  async listComponents(subjectId: string) {
    const result = await db.query<GradeComponent>(
      "SELECT * FROM grade_components WHERE subject_id = $1::uuid ORDER BY created_at ASC",
      [subjectId]
    );
    return result.rows;
  }

  async findComponentById(id: string) {
    const result = await db.query<GradeComponent>(
      "SELECT * FROM grade_components WHERE id = $1::uuid",
      [id]
    );
    return result.rows[0] ?? null;
  }

  async createComponent(payload: CreateGradeComponentPayload) {
    const result = await db.query<GradeComponent>(
      `
      INSERT INTO grade_components (subject_id, component_name, max_marks, weight_percentage)
      VALUES ($1::uuid, $2, $3::numeric, $4::numeric)
      RETURNING *
      `,
      [
        payload.subject_id,
        payload.component_name,
        payload.max_marks,
        payload.weight_percentage
      ]
    );
    return result.rows[0];
  }

  async updateComponent(id: string, payload: Partial<CreateGradeComponentPayload>) {
    const result = await db.query<GradeComponent>(
      `
      UPDATE grade_components
      SET
        subject_id = COALESCE($1::uuid, subject_id),
        component_name = COALESCE($2::text, component_name),
        max_marks = COALESCE($3::numeric, max_marks),
        weight_percentage = COALESCE($4::numeric, weight_percentage),
        updated_at = NOW()
      WHERE id = $5::uuid
      RETURNING *
      `,
      [
        payload.subject_id ?? null,
        payload.component_name ?? null,
        payload.max_marks ?? null,
        payload.weight_percentage ?? null,
        id
      ]
    );
    return result.rows[0] ?? null;
  }

  async deleteComponent(id: string) {
    const result = await db.query<GradeComponent>(
      "DELETE FROM grade_components WHERE id = $1::uuid RETURNING *",
      [id]
    );
    return result.rows[0] ?? null;
  }

  // --- Grades (Obtained Marks) ---
  async findGradeByComponentId(componentId: string) {
    const result = await db.query<Grade>(
      "SELECT * FROM grades WHERE component_id = $1::uuid",
      [componentId]
    );
    return result.rows[0] ?? null;
  }

  async recordGrade(payload: RecordGradePayload) {
    const result = await db.query<Grade>(
      `
      INSERT INTO grades (component_id, obtained_marks)
      VALUES ($1::uuid, $2::numeric)
      ON CONFLICT (component_id) DO UPDATE
      SET obtained_marks = EXCLUDED.obtained_marks
      RETURNING *
      `,
      [payload.component_id, payload.obtained_marks]
    );
    return result.rows[0];
  }

  async getSubjectWithGrades(subjectId: string) {
    // Get subject metadata
    const subjectResult = await db.query<{
      id: string;
      name: string;
      course_code: string;
      credits: string;
      color: string;
      course_type: "THEORY" | "THEORY_PRACTICAL";
    }>(
      "SELECT id, name, course_code, credits, color, course_type FROM subjects WHERE id = $1::uuid",
      [subjectId]
    );

    const subject = subjectResult.rows[0];
    if (!subject) {
      return null;
    }

    // Get components and grades
    const componentsResult = await db.query<{
      id: string;
      component_name: string;
      max_marks: string;
      weight_percentage: string;
      obtained_marks: string | null;
    }>(
      `
      SELECT 
        gc.id, 
        gc.component_name, 
        gc.max_marks::text, 
        gc.weight_percentage::text, 
        g.obtained_marks::text AS obtained_marks
      FROM grade_components gc
      LEFT JOIN grades g ON g.component_id = gc.id
      WHERE gc.subject_id = $1::uuid
      ORDER BY gc.created_at ASC
      `,
      [subjectId]
    );

    const components = componentsResult.rows.map(row => ({
      id: row.id,
      component_name: row.component_name,
      max_marks: Number(row.max_marks),
      weight_percentage: Number(row.weight_percentage),
      obtained_marks: row.obtained_marks !== null ? Number(row.obtained_marks) : null
    }));

    // Calculate aggregated stats
    let totalWeightSubmitted = 0;
    let earnedPoints = 0;

    for (const comp of components) {
      if (comp.obtained_marks !== null) {
        totalWeightSubmitted += comp.weight_percentage;
        // (obtained / max) * weight_percentage
        earnedPoints += (comp.obtained_marks / comp.max_marks) * comp.weight_percentage;
      }
    }

    const calculatedPercentage = totalWeightSubmitted > 0
      ? Number(((earnedPoints / totalWeightSubmitted) * 100).toFixed(2))
      : null;

    return {
      subject_id: subject.id,
      subject_name: subject.name,
      course_code: subject.course_code,
      credits: Number(subject.credits),
      color: subject.color,
      course_type: subject.course_type,
      components,
      calculated_percentage: calculatedPercentage,
      total_weight_submitted: totalWeightSubmitted
    };
  }
}
