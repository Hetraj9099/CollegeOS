import type { Request, Response } from "express";
import { StudyService } from "./service.js";

const service = new StudyService();

export function listStudyController(_req: Request, res: Response) {
  void service;
  res.status(200).json({ message: "study placeholder" });
}
