import { CgpaRepository } from "./repository.js";

export class CgpaService {
  constructor(private readonly repository = new CgpaRepository()) {
    void this.repository;
  }
}
