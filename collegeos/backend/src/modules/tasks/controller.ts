import type { Request, Response } from "express";
import { TasksService } from "./service.js";
import { createTaskListSchema, createTaskSchema, updateTaskSchema } from "./validator.js";

const service = new TasksService();

// --- Task Lists ---
export async function listListsController(req: Request, res: Response) {
  const lists = await service.listLists();
  res.status(200).json(lists);
}

export async function createListController(req: Request, res: Response) {
  const parseResult = createTaskListSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ message: "Invalid payload", errors: parseResult.error.format() });
    return;
  }
  try {
    const list = await service.createList(parseResult.data);
    res.status(201).json(list);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export async function deleteListController(req: Request, res: Response) {
  const id = req.params.id as string;
  try {
    const list = await service.deleteList(id);
    if (!list) {
      res.status(404).json({ message: "Task list not found" });
      return;
    }
    res.status(200).json(list);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

// --- Tasks ---
export async function listTasksController(req: Request, res: Response) {
  const filters = {
    list_id: req.query.list_id ? String(req.query.list_id) : undefined,
    subject_id: req.query.subject_id ? String(req.query.subject_id) : undefined,
    status: req.query.status ? String(req.query.status) : undefined,
    q: req.query.q ? String(req.query.q) : undefined,
    sortBy: req.query.sortBy ? String(req.query.sortBy) : undefined
  };

  const tasks = await service.listTasks(filters);
  res.status(200).json(tasks);
}

export async function getTaskController(req: Request, res: Response) {
  const id = req.params.id as string;
  const task = await service.getTask(id);
  if (!task) {
    res.status(404).json({ message: "Task not found" });
    return;
  }
  res.status(200).json(task);
}

export async function createTaskController(req: Request, res: Response) {
  const parseResult = createTaskSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ message: "Invalid payload", errors: parseResult.error.format() });
    return;
  }
  try {
    const task = await service.createTask(parseResult.data);
    res.status(201).json(task);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export async function updateTaskController(req: Request, res: Response) {
  const id = req.params.id as string;
  const parseResult = updateTaskSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ message: "Invalid payload", errors: parseResult.error.format() });
    return;
  }
  try {
    const task = await service.updateTask(id, parseResult.data);
    if (!task) {
      res.status(404).json({ message: "Task not found" });
      return;
    }
    res.status(200).json(task);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export async function deleteTaskController(req: Request, res: Response) {
  const id = req.params.id as string;
  try {
    const task = await service.deleteTask(id);
    if (!task) {
      res.status(404).json({ message: "Task not found" });
      return;
    }
    res.status(200).json(task);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}
