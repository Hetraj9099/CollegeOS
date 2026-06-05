import { SemestersRepository } from "./repository.js";

export class SemestersService {
  constructor(private readonly repository = new SemestersRepository()) {
    void this.repository;
  }
}
