import { z } from "zod";

const timePattern = /^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/;

export const createTimetableEntrySchema = z.object({
  subject_id: z.string().uuid("Invalid subject ID"),
  day_of_week: z.number().int().min(1).max(7),
  start_time: z.string().regex(timePattern, "Must be a valid time (HH:MM or HH:MM:SS)"),
  end_time: z.string().regex(timePattern, "Must be a valid time (HH:MM or HH:MM:SS)"),
  classroom: z.string().nullable().optional()
}).refine(data => {
  // Rough comparison of time strings
  return data.end_time > data.start_time;
}, {
  message: "End time must be after start time",
  path: ["end_time"]
});

export const updateTimetableEntrySchema = z.object({
  subject_id: z.string().uuid("Invalid subject ID").optional(),
  day_of_week: z.number().int().min(1).max(7).optional(),
  start_time: z.string().regex(timePattern, "Must be a valid time (HH:MM or HH:MM:SS)").optional(),
  end_time: z.string().regex(timePattern, "Must be a valid time (HH:MM or HH:MM:SS)").optional(),
  classroom: z.string().nullable().optional()
});
