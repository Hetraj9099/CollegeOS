import type { Request, Response } from "express";
import { GradesService } from "./service.js";
import {
  createGradeComponentSchema,
  updateGradeComponentSchema,
  recordGradeSchema
} from "./validator.js";

const service = new GradesService();

export async function listComponentsController(req: Request, res: Response) {
  const subjectId = req.query.subjectId as string;
  if (!subjectId) {
    res.status(400).json({ message: "subjectId is required" });
    return;
  }
  const components = await service.listComponents(subjectId);
  res.status(200).json(components);
}

export async function createComponentController(req: Request, res: Response) {
  const parseResult = createGradeComponentSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ message: "Invalid payload", errors: parseResult.error.format() });
    return;
  }
  try {
    const component = await service.createComponent(parseResult.data);
    res.status(201).json(component);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export async function updateComponentController(req: Request, res: Response) {
  const parseResult = updateGradeComponentSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ message: "Invalid payload", errors: parseResult.error.format() });
    return;
  }
  const component = await service.updateComponent(req.params.id as string, parseResult.data);
  if (!component) {
    res.status(404).json({ message: "Grade component not found" });
    return;
  }
  res.status(200).json(component);
}

export async function deleteComponentController(req: Request, res: Response) {
  const component = await service.deleteComponent(req.params.id as string);
  if (!component) {
    res.status(404).json({ message: "Grade component not found" });
    return;
  }
  res.status(200).json({ message: "Grade component deleted successfully" });
}

export async function recordGradeController(req: Request, res: Response) {
  const parseResult = recordGradeSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ message: "Invalid payload", errors: parseResult.error.format() });
    return;
  }
  try {
    const grade = await service.recordGrade(parseResult.data);
    res.status(200).json(grade);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export async function getSubjectSummaryController(req: Request, res: Response) {
  const subjectId = req.params.subjectId as string;
  const summary = await service.getSubjectGradesSummary(subjectId);
  if (!summary) {
    res.status(404).json({ message: "Subject grades summary not found" });
    return;
  }
  res.status(200).json(summary);
}
