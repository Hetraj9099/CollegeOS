import type { Request, Response } from "express";
import { CalendarService } from "./service.js";
import { createCalendarEventSchema, updateCalendarEventSchema } from "./validator.js";

const service = new CalendarService();

export async function listEventsController(req: Request, res: Response) {
  const startDate = req.query.startDate ? String(req.query.startDate) : undefined;
  const endDate = req.query.endDate ? String(req.query.endDate) : undefined;

  const events = await service.listEvents(startDate, endDate);
  res.status(200).json(events);
}

export async function createEventController(req: Request, res: Response) {
  const parseResult = createCalendarEventSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ message: "Invalid payload", errors: parseResult.error.format() });
    return;
  }
  try {
    const event = await service.createEvent(parseResult.data);
    res.status(201).json(event);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export async function getEventController(req: Request, res: Response) {
  const id = req.params.id as string;
  const event = await service.getEvent(id);
  if (!event) {
    res.status(404).json({ message: "Event not found" });
    return;
  }
  res.status(200).json(event);
}

export async function updateEventController(req: Request, res: Response) {
  const id = req.params.id as string;
  const parseResult = updateCalendarEventSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ message: "Invalid payload", errors: parseResult.error.format() });
    return;
  }
  try {
    const event = await service.updateEvent(id, parseResult.data);
    if (!event) {
      res.status(404).json({ message: "Event not found" });
      return;
    }
    res.status(200).json(event);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export async function deleteEventController(req: Request, res: Response) {
  const id = req.params.id as string;
  try {
    const event = await service.deleteEvent(id);
    if (!event) {
      res.status(404).json({ message: "Event not found" });
      return;
    }
    res.status(200).json(event);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}
