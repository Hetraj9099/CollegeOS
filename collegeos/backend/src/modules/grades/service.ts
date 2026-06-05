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
    return this.repository.createComponent(payload);
  }

  async updateComponent(id: string, payload: Partial<CreateGradeComponentPayload>) {
    return this.repository.updateComponent(id, payload);
  }

  async deleteComponent(id: string) {
    return this.repository.deleteComponent(id);
  }

  async recordGrade(payload: RecordGradePayload) {
    return this.repository.recordGrade(payload);
  }

  async getSubjectGradesSummary(subjectId: string) {
    return this.repository.getSubjectWithGrades(subjectId);
  }
}
