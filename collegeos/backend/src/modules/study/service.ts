import { StudyRepository } from "./repository.js";

export class StudyService {
  constructor(private readonly repository = new StudyRepository()) {
    void this.repository;
  }
}
