import { db } from "../../database/connection.js";

type UserRecord = {
  id: string;
  password_hash: string;
};

export class AuthRepository {
  async countUsers() {
    const result = await db.query<{ count: string }>("SELECT COUNT(*)::text AS count FROM users");
    return Number(result.rows[0]?.count ?? 0);
  }

  async findPrimaryUser(): Promise<UserRecord | null> {
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

  async createUser(passwordHash: string) {
    const result = await db.query<{ id: string }>(
      `
      INSERT INTO users (password_hash)
      VALUES ($1)
      ON CONFLICT DO NOTHING
      RETURNING id
      `,
      [passwordHash]
    );

    return result.rows[0] ?? null;
  }
}
