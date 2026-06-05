import type { Request, Response } from "express";
import { SubjectsService } from "./service.js";
import { createSubjectSchema, updateSubjectSchema } from "./validator.js";

const service = new SubjectsService();

export async function listSubjectsController(req: Request, res: Response) {
  const semesterId = req.query.semesterId as string | undefined;
  const subjects = await service.listSubjects(semesterId);
  res.status(200).json(subjects);
}

export async function getSubjectController(req: Request, res: Response) {
  const subject = await service.getSubject(req.params.id as string);
  if (!subject) {
    res.status(404).json({ message: "Subject not found" });
    return;
  }
  res.status(200).json(subject);
}

export async function createSubjectController(req: Request, res: Response) {
  const parseResult = createSubjectSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ message: "Invalid payload", errors: parseResult.error.format() });
    return;
  }
  try {
    const subject = await service.createSubject(parseResult.data);
    res.status(201).json(subject);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export async function updateSubjectController(req: Request, res: Response) {
  const parseResult = updateSubjectSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ message: "Invalid payload", errors: parseResult.error.format() });
    return;
  }
  const subject = await service.updateSubject(req.params.id as string, parseResult.data);
  if (!subject) {
    res.status(404).json({ message: "Subject not found" });
    return;
  }
  res.status(200).json(subject);
}

export async function deleteSubjectController(req: Request, res: Response) {
  const subject = await service.deleteSubject(req.params.id as string);
  if (!subject) {
    res.status(404).json({ message: "Subject not found" });
    return;
  }
  res.status(200).json({ message: "Subject deleted successfully" });
}
