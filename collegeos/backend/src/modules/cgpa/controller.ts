import type { Request, Response } from "express";
import { CgpaService } from "./service.js";
import { setCgpaGoalSchema } from "./validator.js";

const service = new CgpaService();

export async function getCgpaController(req: Request, res: Response) {
  const remainingSemesters = req.query.remainingSemesters 
    ? Number(req.query.remainingSemesters)
    : undefined;

  const summary = await service.getFeasibilitySummary(remainingSemesters);
  res.status(200).json(summary);
}

export async function setCgpaGoalController(req: Request, res: Response) {
  const parseResult = setCgpaGoalSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ message: "Invalid payload", errors: parseResult.error.format() });
    return;
  }
  try {
    const goal = await service.setGoal(parseResult.data);
    res.status(200).json(goal);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}
