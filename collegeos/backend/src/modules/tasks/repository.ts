import { db } from "../../database/connection.js";
import type { Task, TaskList, CreateTaskListPayload, CreateTaskPayload, UpdateTaskPayload } from "./types.js";

export class TasksRepository {
  // --- Task Lists ---
  async listLists(): Promise<TaskList[]> {
    const result = await db.query<TaskList>(
      "SELECT * FROM task_lists ORDER BY name ASC"
    );
    return result.rows;
  }

  async createList(payload: CreateTaskListPayload): Promise<TaskList> {
    const result = await db.query<TaskList>(
      `
      INSERT INTO task_lists (name, color)
      VALUES ($1, $2)
      RETURNING *
      `,
      [payload.name, payload.color]
    );
    return result.rows[0];
  }

  async deleteList(id: string): Promise<TaskList | null> {
    const result = await db.query<TaskList>(
      "DELETE FROM task_lists WHERE id = $1 RETURNING *",
      [id]
    );
    return result.rows[0] ?? null;
  }

  // --- Tasks ---
  async listTasks(filters: {
    list_id?: string;
    subject_id?: string;
    status?: string;
    q?: string;
    sortBy?: string;
  }): Promise<Task[]> {
    const queryParams: any[] = [];
    let queryText = "SELECT * FROM tasks WHERE 1=1";

    if (filters.list_id) {
      queryParams.push(filters.list_id);
      queryText += ` AND list_id = $${queryParams.length}`;
    }

    if (filters.subject_id) {
      queryParams.push(filters.subject_id);
      queryText += ` AND subject_id = $${queryParams.length}`;
    }

    if (filters.status) {
      queryParams.push(filters.status);
      queryText += ` AND status = $${queryParams.length}`;
    }

    if (filters.q) {
      queryParams.push(`%${filters.q}%`);
      queryText += ` AND (title ILIKE $${queryParams.length} OR description ILIKE $${queryParams.length})`;
    }

    // Default sorting
    if (filters.sortBy === "due_date_asc") {
      queryText += " ORDER BY due_date ASC NULLS LAST, created_at DESC";
    } else if (filters.sortBy === "due_date_desc") {
      queryText += " ORDER BY due_date DESC NULLS LAST, created_at DESC";
    } else if (filters.sortBy === "priority_high_first") {
      queryText += ` ORDER BY 
        CASE priority 
          WHEN 'HIGH' THEN 1 
          WHEN 'MEDIUM' THEN 2 
          WHEN 'LOW' THEN 3 
          ELSE 4 
        END ASC, created_at DESC`;
    } else {
      queryText += " ORDER BY created_at DESC";
    }

    const result = await db.query<Task>(queryText, queryParams);
    return result.rows;
  }

  async findTaskById(id: string): Promise<Task | null> {
    const result = await db.query<Task>(
      "SELECT * FROM tasks WHERE id = $1",
      [id]
    );
    return result.rows[0] ?? null;
  }

  async createTask(payload: CreateTaskPayload): Promise<Task> {
    const completed = payload.status === "DONE";
    const completedAt = completed ? new Date() : null;

    const result = await db.query<Task>(
      `
      INSERT INTO tasks (list_id, subject_id, title, description, priority, status, due_date, completed, completed_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
      `,
      [
        payload.list_id,
        payload.subject_id ?? null,
        payload.title,
        payload.description ?? null,
        payload.priority,
        payload.status,
        payload.due_date ? new Date(payload.due_date) : null,
        completed,
        completedAt
      ]
    );
    return result.rows[0];
  }

  async updateTask(id: string, payload: UpdateTaskPayload): Promise<Task | null> {
    // We fetch the existing task first to ensure database constraints for completion states are respected
    const current = await this.findTaskById(id);
    if (!current) return null;

    let updatedStatus = payload.status ?? current.status;
    let updatedCompleted = payload.completed ?? current.completed;

    // Harmonize status and completed
    if (payload.completed !== undefined) {
      if (payload.completed) {
        updatedStatus = "DONE";
      } else {
        if (current.status === "DONE") {
          updatedStatus = "TODO";
        }
      }
    } else if (payload.status !== undefined) {
      updatedCompleted = payload.status === "DONE";
    }

    const completedAt = updatedCompleted 
      ? (current.completed_at ? current.completed_at : new Date())
      : null;

    const listId = payload.list_id ?? current.list_id;
    const subjectId = payload.subject_id === undefined ? current.subject_id : payload.subject_id;
    const title = payload.title ?? current.title;
    const description = payload.description === null ? null : (payload.description ?? current.description);
    const priority = payload.priority ?? current.priority;
    const dueDate = payload.due_date === null ? null : (payload.due_date ? new Date(payload.due_date) : current.due_date);

    const result = await db.query<Task>(
      `
      UPDATE tasks
      SET
        list_id = $1,
        subject_id = $2,
        title = $3,
        description = $4,
        priority = $5,
        status = $6,
        due_date = $7,
        completed = $8,
        completed_at = $9,
        updated_at = NOW()
      WHERE id = $10
      RETURNING *
      `,
      [
        listId,
        subjectId,
        title,
        description,
        priority,
        updatedStatus,
        dueDate,
        updatedCompleted,
        completedAt,
        id
      ]
    );
    return result.rows[0] ?? null;
  }

  async deleteTask(id: string): Promise<Task | null> {
    const result = await db.query<Task>(
      "DELETE FROM tasks WHERE id = $1 RETURNING *",
      [id]
    );
    return result.rows[0] ?? null;
  }
}
