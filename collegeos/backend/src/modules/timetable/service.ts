import { TimetableRepository } from "./repository.js";

export class TimetableService {
  constructor(private readonly repository = new TimetableRepository()) {
    void this.repository;
  }
}
