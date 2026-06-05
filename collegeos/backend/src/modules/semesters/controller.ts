import type { Request, Response } from "express";
import { SemestersService } from "./service.js";

const service = new SemestersService();

export function listSemestersController(_req: Request, res: Response) {
  void service;
  res.status(200).json({ message: "semesters placeholder" });
}
