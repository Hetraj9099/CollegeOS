import { z } from "zod";

export const createGradeComponentSchema = z.object({
  subject_id: z.string().uuid(),
  component_name: z.string().min(1),
  max_marks: z.number().positive(),
  weight_percentage: z.number().min(0).max(100)
});

export const updateGradeComponentSchema = createGradeComponentSchema.partial();

export const recordGradeSchema = z.object({
  component_id: z.string().uuid(),
  obtained_marks: z.number().nonnegative()
});
