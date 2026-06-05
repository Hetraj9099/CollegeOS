import { SemestersRepository } from "./repository.js";
import type { CreateSemesterPayload } from "./types.js";

export class SemestersService {
  constructor(private readonly repository = new SemestersRepository()) {}

  async listSemesters() {
    return this.repository.list();
  }

  async getSemester(id: string) {
    return this.repository.findById(id);
  }

  async createSemester(payload: CreateSemesterPayload) {
    return this.repository.create(payload);
  }

  async updateSemester(id: string, payload: Partial<CreateSemesterPayload>) {
    return this.repository.update(id, payload);
  }

  async deleteSemester(id: string) {
    return this.repository.delete(id);
  }
}
