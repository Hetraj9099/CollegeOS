import { z } from "zod";

export const createSubjectSchema = z.object({
  semester_id: z.string().uuid(),
  name: z.string().min(1),
  course_code: z.string().min(1),
  credits: z.number().positive(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  course_type: z.enum(["THEORY", "THEORY_PRACTICAL"]).default("THEORY")
});

export const updateSubjectSchema = createSubjectSchema.partial();
