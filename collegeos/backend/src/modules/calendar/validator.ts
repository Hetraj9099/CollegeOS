import { z } from "zod";

export const createCalendarEventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  start_time: z.string().datetime({ offset: true }),
  end_time: z.string().datetime({ offset: true }),
  event_type: z.enum(["EXAM", "ASSIGNMENT", "STUDY", "PERSONAL", "CLASS"]),
  related_task_id: z.string().uuid("Invalid task ID").nullable().optional()
}).refine(data => new Date(data.end_time) > new Date(data.start_time), {
  message: "End time must be after start time",
  path: ["end_time"]
});

export const updateCalendarEventSchema = z.object({
  title: z.string().min(1, "Title cannot be empty").optional(),
  description: z.string().nullable().optional(),
  start_time: z.string().datetime({ offset: true }).optional(),
  end_time: z.string().datetime({ offset: true }).optional(),
  event_type: z.enum(["EXAM", "ASSIGNMENT", "STUDY", "PERSONAL", "CLASS"]).optional(),
  related_task_id: z.string().uuid("Invalid task ID").nullable().optional()
});
