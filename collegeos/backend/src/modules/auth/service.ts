import { AuthRepository } from "./repository.js";
import { hashPassword, verifyPassword } from "../../utils/password.js";

export class AuthService {
  constructor(private readonly repository = new AuthRepository()) {
    void this.repository;
  }

  async getStatus() {
    const userCount = await this.repository.countUsers();
    return { hasUser: userCount > 0 };
  }

  async setup(password: string) {
    const status = await this.getStatus();

    if (status.hasUser) {
      return null;
    }

    const passwordHash = await hashPassword(password);
    const user = await this.repository.createUser(passwordHash);

    if (!user) {
      return null;
    }

    return { userId: user.id };
  }

  async unlock(password: string) {
    const user = await this.repository.findPrimaryUser();

    if (!user) {
      return null;
    }

    const passwordMatches = await verifyPassword(password, user.password_hash);

    if (!passwordMatches) {
      return null;
    }

    return { userId: user.id };
  }
}
