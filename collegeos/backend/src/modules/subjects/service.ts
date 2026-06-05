import { SubjectsRepository } from "./repository.js";
import { GradesRepository } from "../grades/repository.js";
import type { CreateSubjectPayload } from "./types.js";

export class SubjectsService {
  constructor(
    private readonly repository = new SubjectsRepository(),
    private readonly gradesRepository = new GradesRepository()
  ) {}

  async listSubjects(semesterId?: string) {
    return this.repository.list(semesterId);
  }

  async getSubject(id: string) {
    return this.repository.findById(id);
  }

  async createSubject(payload: CreateSubjectPayload) {
    const subject = await this.repository.create(payload);

    if (subject.course_type === "THEORY") {
      await this.gradesRepository.createComponent({
        subject_id: subject.id,
        component_name: "CIE-TH",
        max_marks: 60,
        weight_percentage: 60
      });
      await this.gradesRepository.createComponent({
        subject_id: subject.id,
        component_name: "ESE-TH",
        max_marks: 40,
        weight_percentage: 40
      });
    } else if (subject.course_type === "THEORY_PRACTICAL") {
      await this.gradesRepository.createComponent({
        subject_id: subject.id,
        component_name: "CIE-TH",
        max_marks: 60,
        weight_percentage: 30
      });
      await this.gradesRepository.createComponent({
        subject_id: subject.id,
        component_name: "ESE-TH",
        max_marks: 40,
        weight_percentage: 20
      });
      await this.gradesRepository.createComponent({
        subject_id: subject.id,
        component_name: "CIE-PR",
        max_marks: 60,
        weight_percentage: 30
      });
      await this.gradesRepository.createComponent({
        subject_id: subject.id,
        component_name: "ESE-PR",
        max_marks: 40,
        weight_percentage: 20
      });
    }

    return subject;
  }

  async updateSubject(id: string, payload: Partial<CreateSubjectPayload>) {
    return this.repository.update(id, payload);
  }

  async deleteSubject(id: string) {
    return this.repository.delete(id);
  }
}
