import { Router } from "express";
import { listTasksController } from "./controller.js";

export const tasksRoutes = Router();

tasksRoutes.get("/", listTasksController);
