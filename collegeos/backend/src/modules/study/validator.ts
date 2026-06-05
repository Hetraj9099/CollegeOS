import { z } from "zod";

export const startStudySessionSchema = z.object({
  subject_id: z.string().uuid("Invalid subject ID").nullable().optional(),
  task_id: z.string().uuid("Invalid task ID").nullable().optional(),
  session_type: z.string().min(1, "Session type is required"),
  start_time: z.string().datetime({ offset: true })
});

export const stopStudySessionSchema = z.object({
  end_time: z.string().datetime({ offset: true }),
  notes: z.string().nullable().optional()
});

export const createStudySessionSchema = z.object({
  subject_id: z.string().uuid("Invalid subject ID").nullable().optional(),
  task_id: z.string().uuid("Invalid task ID").nullable().optional(),
  session_type: z.string().min(1, "Session type is required"),
  start_time: z.string().datetime({ offset: true }),
  end_time: z.string().datetime({ offset: true }),
  notes: z.string().nullable().optional()
}).refine(data => new Date(data.end_time) > new Date(data.start_time), {
  message: "End time must be after start time",
  path: ["end_time"]
});
