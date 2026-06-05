import type { Request, Response } from "express";
import { CalendarService } from "./service.js";

const service = new CalendarService();

export function listCalendarController(_req: Request, res: Response) {
  void service;
  res.status(200).json({ message: "calendar placeholder" });
}
