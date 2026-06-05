import { db } from "../../database/connection.js";

type UserRecord = {
  id: string;
  password_hash: string;
};

export class AuthRepository {
  async findPrimaryUser() {
    const result = await db.query<UserRecord>(
      `
      SELECT id, password_hash
      FROM users
      ORDER BY created_at ASC
      LIMIT 1
      `
    );

    return result.rows[0] ?? null;
  }
}
