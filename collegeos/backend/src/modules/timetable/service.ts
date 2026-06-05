import { TimetableRepository } from "./repository.js";
import type { CreateTimetableEntryPayload, UpdateTimetableEntryPayload } from "./types.js";

export class TimetableService {
  constructor(private readonly repository = new TimetableRepository()) {}

  async listEntries(dayOfWeek?: number) {
    return this.repository.listEntries(dayOfWeek);
  }

  async getEntry(id: string) {
    return this.repository.findById(id);
  }

  async createEntry(payload: CreateTimetableEntryPayload) {
    return this.repository.create(payload);
  }

  async updateEntry(id: string, payload: UpdateTimetableEntryPayload) {
    return this.repository.update(id, payload);
  }

  async deleteEntry(id: string) {
    return this.repository.delete(id);
  }
}
