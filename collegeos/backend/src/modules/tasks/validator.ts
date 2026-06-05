import { z } from "zod";

export const createTaskListSchema = z.object({
  name: z.string().min(1, "Name is required"),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color code")
});

export const createTaskSchema = z.object({
  list_id: z.string().uuid("Invalid list ID"),
  subject_id: z.string().uuid("Invalid subject ID").nullable().optional(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]),
  due_date: z.string().datetime({ offset: true }).nullable().optional()
});

export const updateTaskSchema = z.object({
  list_id: z.string().uuid("Invalid list ID").optional(),
  subject_id: z.string().uuid("Invalid subject ID").nullable().optional(),
  title: z.string().min(1, "Title cannot be empty").optional(),
  description: z.string().nullable().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
  due_date: z.string().datetime({ offset: true }).nullable().optional(),
  completed: z.boolean().optional()
});
