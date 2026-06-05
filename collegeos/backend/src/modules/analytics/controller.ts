import type { Request, Response } from "express";
import { AnalyticsService } from "./service.js";
import { getAnalyticsSchema } from "./validator.js";

const service = new AnalyticsService();

export async function getAnalyticsController(req: Request, res: Response) {
  const parseResult = getAnalyticsSchema.safeParse(req.query);
  if (!parseResult.success) {
    res.status(400).json({ message: "Invalid query parameters", errors: parseResult.error.format() });
    return;
  }
  try {
    const data = await service.getDashboardData(parseResult.data.tzOffset);
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}
