import { z } from "zod";

export const createSemesterSchema = z.object({
  semester_number: z.number().int().positive(),
  academic_year: z.string().regex(/^[0-9]{4}-[0-9]{4}$/),
  total_credits: z.number().nonnegative().default(0),
  sgpa: z.number().min(0).max(10).nullish(),
  cgpa: z.number().min(0).max(10).nullish()
});

export const updateSemesterSchema = createSemesterSchema.partial();
