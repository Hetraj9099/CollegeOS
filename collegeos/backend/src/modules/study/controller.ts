import type { Request, Response } from "express";
import { StudyService } from "./service.js";
import { startStudySessionSchema, stopStudySessionSchema, createStudySessionSchema } from "./validator.js";

const service = new StudyService();

export async function getActiveSessionController(req: Request, res: Response) {
  const active = await service.getActiveSession();
  res.status(200).json(active);
}

export async function startSessionController(req: Request, res: Response) {
  const parseResult = startStudySessionSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ message: "Invalid payload", errors: parseResult.error.format() });
    return;
  }
  try {
    const session = await service.startSession(parseResult.data);
    res.status(201).json(session);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
}

export async function stopSessionController(req: Request, res: Response) {
  const parseResult = stopStudySessionSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ message: "Invalid payload", errors: parseResult.error.format() });
    return;
  }
  try {
    const session = await service.stopSession(parseResult.data);
    res.status(200).json(session);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
}

export async function listSessionsController(req: Request, res: Response) {
  const subjectId = req.query.subject_id ? String(req.query.subject_id) : undefined;
  const limit = req.query.limit ? Number(req.query.limit) : undefined;

  const logs = await service.listSessions({ subject_id: subjectId, limit });
  res.status(200).json(logs);
}

export async function createSessionController(req: Request, res: Response) {
  const parseResult = createStudySessionSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ message: "Invalid payload", errors: parseResult.error.format() });
    return;
  }
  try {
    const log = await service.createSession(parseResult.data);
    res.status(201).json(log);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export async function deleteSessionController(req: Request, res: Response) {
  const id = req.params.id as string;
  try {
    const log = await service.deleteSession(id);
    if (!log) {
      res.status(404).json({ message: "Study log not found" });
      return;
    }
    res.status(200).json(log);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export async function getStreakSummaryController(req: Request, res: Response) {
  const timezoneOffsetMinutes = req.query.tzOffset
    ? Number(req.query.tzOffset)
    : 0;

  const streak = await service.getStreakSummary(timezoneOffsetMinutes);
  res.status(200).json(streak);
}
