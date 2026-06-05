import { GradesRepository } from "./repository.js";

export class GradesService {
  constructor(private readonly repository = new GradesRepository()) {
    void this.repository;
  }
}
