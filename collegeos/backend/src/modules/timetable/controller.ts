import type { Request, Response } from "express";
import { TimetableService } from "./service.js";

const service = new TimetableService();

export function listTimetableController(_req: Request, res: Response) {
  void service;
  res.status(200).json({ message: "timetable placeholder" });
}
