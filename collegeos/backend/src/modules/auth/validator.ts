import { z } from "zod";

export const setupSchema = z.object({
  password: z.string().min(8).max(128)
});

export const unlockSchema = z.object({
  password: z.string().min(1)
});
