import { db } from "../../database/connection.js";
import { SemestersRepository } from "../semesters/repository.js";
import { GradesRepository } from "./repository.js";
import type {
  CreateGradeComponentPayload,
  RecordGradePayload
} from "./types.js";

export class GradesService {
  constructor(private readonly repository = new GradesRepository()) {}

  async listComponents(subjectId: string) {
    return this.repository.listComponents(subjectId);
  }

  async createComponent(payload: CreateGradeComponentPayload) {
    const component = await this.repository.createComponent(payload);
    const semResult = await db.query<{ semester_id: string }>(
      "SELECT semester_id FROM subjects WHERE id = $1::uuid",
      [payload.subject_id]
    );
    const semId = semResult.rows[0]?.semester_id;
    if (semId) {
      const semestersRepo = new SemestersRepository();
      await semestersRepo.recalculateGpa(semId);
    }
    return component;
  }

  async updateComponent(id: string, payload: Partial<CreateGradeComponentPayload>) {
    const component = await this.repository.updateComponent(id, payload);
    if (component) {
      const semResult = await db.query<{ semester_id: string }>(
        "SELECT semester_id FROM subjects WHERE id = $1::uuid",
        [component.subject_id]
      );
      const semId = semResult.rows[0]?.semester_id;
      if (semId) {
        const semestersRepo = new SemestersRepository();
        await semestersRepo.recalculateGpa(semId);
      }
    }
    return component;
  }

  async deleteComponent(id: string) {
    const semResult = await db.query<{ semester_id: string }>(
      `
      SELECT s.semester_id 
      FROM grade_components gc
      JOIN subjects s ON s.id = gc.subject_id
      WHERE gc.id = $1::uuid
      `,
      [id]
    );
    const semId = semResult.rows[0]?.semester_id;
    const component = await this.repository.deleteComponent(id);
    if (semId) {
      const semestersRepo = new SemestersRepository();
      await semestersRepo.recalculateGpa(semId);
    }
    return component;
  }

  async recordGrade(payload: RecordGradePayload) {
    const grade = await this.repository.recordGrade(payload);
    const semResult = await db.query<{ semester_id: string }>(
      `
      SELECT s.semester_id 
      FROM grade_components gc
      JOIN subjects s ON s.id = gc.subject_id
      WHERE gc.id = $1::uuid
      `,
      [payload.component_id]
    );
    const semId = semResult.rows[0]?.semester_id;
    if (semId) {
      const semestersRepo = new SemestersRepository();
      await semestersRepo.recalculateGpa(semId);
    }
    return grade;
  }

  async getSubjectGradesSummary(subjectId: string) {
    return this.repository.getSubjectWithGrades(subjectId);
  }
}
