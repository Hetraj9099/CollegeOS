import { AuthRepository } from "./repository.js";

export class AuthService {
  constructor(private readonly repository = new AuthRepository()) {
    void this.repository;
  }
}
