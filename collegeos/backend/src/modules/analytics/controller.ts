import type { Request, Response } from "express";
import { AnalyticsService } from "./service.js";

const service = new AnalyticsService();

export function getAnalyticsController(_req: Request, res: Response) {
  void service;
  res.status(200).json({ message: "analytics placeholder" });
}
