import { db } from "../../database/connection.js";
import type { CgpaGoal, SetCgpaGoalPayload } from "./types.js";

export class CgpaRepository {
  async getLatestGoal() {
    const result = await db.query<CgpaGoal>(
      "SELECT * FROM cgpa_goals ORDER BY created_at DESC LIMIT 1"
    );
    return result.rows[0] ?? null;
  }

  async setGoal(payload: SetCgpaGoalPayload) {
    const latest = await this.getLatestGoal();
    if (latest) {
      const result = await db.query<CgpaGoal>(
        `
        UPDATE cgpa_goals
        SET current_cgpa = $1, target_cgpa = $2, updated_at = NOW()
        WHERE id = $3
        RETURNING *
        `,
        [payload.current_cgpa, payload.target_cgpa, latest.id]
      );
      return result.rows[0];
    } else {
      const result = await db.query<CgpaGoal>(
        `
        INSERT INTO cgpa_goals (current_cgpa, target_cgpa)
        VALUES ($1, $2)
        RETURNING *
        `,
        [payload.current_cgpa, payload.target_cgpa]
      );
      return result.rows[0];
    }
  }
}
