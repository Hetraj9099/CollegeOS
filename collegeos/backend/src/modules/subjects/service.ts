import { SubjectsRepository } from "./repository.js";

export class SubjectsService {
  constructor(private readonly repository = new SubjectsRepository()) {
    void this.repository;
  }
}
