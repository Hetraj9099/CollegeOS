import { db } from "../../database/connection.js";
import type { Semester, CreateSemesterPayload } from "./types.js";

export class SemestersRepository {
  async list() {
    // Recalculate GPA for all semesters to keep DB fresh
    const semestersResult = await db.query<{ id: string }>("SELECT id FROM semesters");
    for (const sem of semestersResult.rows) {
      await this.recalculateGpa(sem.id);
    }

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
        semester_number = COALESCE($1::integer, semester_number),
        academic_year = COALESCE($2::text, academic_year),
        total_credits = COALESCE($3::integer, total_credits),
        sgpa = COALESCE($4::numeric, sgpa),
        cgpa = COALESCE($5::numeric, cgpa),
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

  async recalculateGpa(semesterId: string) {
    // 1. Get all subjects in the semester
    const subjectsResult = await db.query<{ id: string; credits: string }>(
      "SELECT id, credits::text FROM subjects WHERE semester_id = $1::uuid",
      [semesterId]
    );

    let totalPoints = 0;
    let totalCredits = 0;

    for (const sub of subjectsResult.rows) {
      // 2. Fetch all components and grades for this subject
      const componentsResult = await db.query<{ max_marks: string; weight_percentage: string; obtained_marks: string | null }>(
        `
        SELECT 
          gc.max_marks::text, 
          gc.weight_percentage::text, 
          g.obtained_marks::text AS obtained_marks
        FROM grade_components gc
        LEFT JOIN grades g ON g.component_id = gc.id
        WHERE gc.subject_id = $1::uuid
        `,
        [sub.id]
      );

      let totalWeightSubmitted = 0;
      let earnedPoints = 0;

      for (const comp of componentsResult.rows) {
        if (comp.obtained_marks !== null) {
          totalWeightSubmitted += Number(comp.weight_percentage);
          earnedPoints += (Number(comp.obtained_marks) / Number(comp.max_marks)) * Number(comp.weight_percentage);
        }
      }

      // If at least one component has a grade, we include this subject in the GPA calculation
      if (totalWeightSubmitted > 0) {
        const calculatedPercentage = (earnedPoints / totalWeightSubmitted) * 100;
        
        // Map percentage to grade points
        let gradePoints = 0;
        if (calculatedPercentage >= 80) gradePoints = 10;
        else if (calculatedPercentage >= 70) gradePoints = 9;
        else if (calculatedPercentage >= 60) gradePoints = 8;
        else if (calculatedPercentage >= 55) gradePoints = 7;
        else if (calculatedPercentage >= 50) gradePoints = 6;
        else if (calculatedPercentage >= 45) gradePoints = 5;
        else if (calculatedPercentage >= 40) gradePoints = 4;
        else gradePoints = 0; // F grade

        const credits = Number(sub.credits);
        totalPoints += credits * gradePoints;
        totalCredits += credits;
      }
    }

    const sgpa = totalCredits > 0 ? Number((totalPoints / totalCredits).toFixed(2)) : null;

    // Update SGPA for this semester
    await db.query("UPDATE semesters SET sgpa = $1::numeric WHERE id = $2::uuid", [sgpa, semesterId]);

    // Recalculate CGPA for all semesters cumulatively
    const semestersResult = await db.query<{ id: string; semester_number: number; sgpa: string | null }>(
      "SELECT id, semester_number, sgpa::text AS sgpa FROM semesters ORDER BY semester_number ASC"
    );

    let cumulativePoints = 0;
    let cumulativeCount = 0;

    for (const sem of semestersResult.rows) {
      if (sem.sgpa !== null) {
        cumulativePoints += Number(sem.sgpa);
        cumulativeCount++;
        const currentCgpa = Number((cumulativePoints / cumulativeCount).toFixed(2));
        await db.query("UPDATE semesters SET cgpa = $1::numeric WHERE id = $2::uuid", [currentCgpa, sem.id]);
      } else {
        await db.query("UPDATE semesters SET cgpa = NULL WHERE id = $1::uuid", [sem.id]);
      }
    }
  }
}
