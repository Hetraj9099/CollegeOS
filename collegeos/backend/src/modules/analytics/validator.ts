import { z } from "zod";

export const getAnalyticsSchema = z.object({
  tzOffset: z.coerce.number().optional().default(0)
});
