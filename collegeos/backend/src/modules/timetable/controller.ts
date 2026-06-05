import type { Request, Response } from "express";
import { TimetableService } from "./service.js";
import { createTimetableEntrySchema, updateTimetableEntrySchema } from "./validator.js";

const service = new TimetableService();

export async function listEntriesController(req: Request, res: Response) {
  const dayOfWeek = req.query.dayOfWeek ? Number(req.query.dayOfWeek) : undefined;
  const entries = await service.listEntries(dayOfWeek);
  res.status(200).json(entries);
}

export async function createEntryController(req: Request, res: Response) {
  const parseResult = createTimetableEntrySchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ message: "Invalid payload", errors: parseResult.error.format() });
    return;
  }
  try {
    const entry = await service.createEntry(parseResult.data);
    res.status(201).json(entry);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export async function getEntryController(req: Request, res: Response) {
  const id = req.params.id as string;
  const entry = await service.getEntry(id);
  if (!entry) {
    res.status(404).json({ message: "Timetable entry not found" });
    return;
  }
  res.status(200).json(entry);
}

export async function updateEntryController(req: Request, res: Response) {
  const id = req.params.id as string;
  const parseResult = updateTimetableEntrySchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ message: "Invalid payload", errors: parseResult.error.format() });
    return;
  }
  try {
    const entry = await service.updateEntry(id, parseResult.data);
    if (!entry) {
      res.status(404).json({ message: "Timetable entry not found" });
      return;
    }
    res.status(200).json(entry);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export async function deleteEntryController(req: Request, res: Response) {
  const id = req.params.id as string;
  try {
    const entry = await service.deleteEntry(id);
    if (!entry) {
      res.status(404).json({ message: "Timetable entry not found" });
      return;
    }
    res.status(200).json(entry);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}
