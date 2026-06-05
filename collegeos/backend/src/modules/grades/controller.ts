import type { Request, Response } from "express";
import { GradesService } from "./service.js";

const service = new GradesService();

export function listGradesController(_req: Request, res: Response) {
  void service;
  res.status(200).json({ message: "grades placeholder" });
}
