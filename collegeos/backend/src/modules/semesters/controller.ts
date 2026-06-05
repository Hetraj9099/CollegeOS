import type { Request, Response } from "express";
import { SemestersService } from "./service.js";
import { createSemesterSchema, updateSemesterSchema } from "./validator.js";

const service = new SemestersService();

export async function listSemestersController(_req: Request, res: Response) {
  const semesters = await service.listSemesters();
  res.status(200).json(semesters);
}

export async function getSemesterController(req: Request, res: Response) {
  const semester = await service.getSemester(req.params.id as string);
  if (!semester) {
    res.status(404).json({ message: "Semester not found" });
    return;
  }
  res.status(200).json(semester);
}

export async function createSemesterController(req: Request, res: Response) {
  const parseResult = createSemesterSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ message: "Invalid payload", errors: parseResult.error.format() });
    return;
  }
  try {
    const semester = await service.createSemester(parseResult.data);
    res.status(201).json(semester);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export async function updateSemesterController(req: Request, res: Response) {
  const parseResult = updateSemesterSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ message: "Invalid payload", errors: parseResult.error.format() });
    return;
  }
  const semester = await service.updateSemester(req.params.id as string, parseResult.data);
  if (!semester) {
    res.status(404).json({ message: "Semester not found" });
    return;
  }
  res.status(200).json(semester);
}

export async function deleteSemesterController(req: Request, res: Response) {
  const semester = await service.deleteSemester(req.params.id as string);
  if (!semester) {
    res.status(404).json({ message: "Semester not found" });
    return;
  }
  res.status(200).json({ message: "Semester deleted successfully" });
}
