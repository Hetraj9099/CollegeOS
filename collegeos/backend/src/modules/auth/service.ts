import { AuthRepository } from "./repository.js";
import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import { env } from "../../config/env.js";
import { verifyPassword } from "../../utils/password.js";

export class AuthService {
  constructor(private readonly repository = new AuthRepository()) {
    void this.repository;
  }

  async login(password: string) {
    const user = await this.repository.findPrimaryUser();

    if (!user) {
      return null;
    }

    const passwordMatches = await verifyPassword(password, user.password_hash);

    if (!passwordMatches) {
      return null;
    }

    const token = jwt.sign({ sub: user.id }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"]
    });

    return { token };
  }
}
