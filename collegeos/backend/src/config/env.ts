import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().default("postgresql://localhost:5432/collegeos"),
  JWT_SECRET: z.string().default("development-secret"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  CLIENT_URL: z.string().default("http://localhost:5173")
});

export const env = envSchema.parse(process.env);
