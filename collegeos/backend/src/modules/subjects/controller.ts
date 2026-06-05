import type { Request, Response } from "express";
import { SubjectsService } from "./service.js";

const service = new SubjectsService();

export function listSubjectsController(_req: Request, res: Response) {
  void service;
  res.status(200).json({ message: "subjects placeholder" });
}
