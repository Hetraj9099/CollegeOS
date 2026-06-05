import { z } from "zod";

export const setCgpaGoalSchema = z.object({
  current_cgpa: z.number().min(0).max(10),
  target_cgpa: z.number().min(0).max(10)
}).refine(data => data.target_cgpa >= data.current_cgpa, {
  message: "Target CGPA cannot be lower than Current CGPA",
  path: ["target_cgpa"]
});
