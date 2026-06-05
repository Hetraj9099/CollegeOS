import type { Request, Response } from "express";
import { TasksService } from "./service.js";

const service = new TasksService();

export function listTasksController(_req: Request, res: Response) {
  void service;
  res.status(200).json({ message: "tasks placeholder" });
}
