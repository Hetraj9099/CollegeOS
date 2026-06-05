import { Router } from "express";
import {
  listListsController,
  createListController,
  deleteListController,
  listTasksController,
  getTaskController,
  createTaskController,
  updateTaskController,
  deleteTaskController
} from "./controller.js";

export const tasksRoutes = Router();

// --- Task Lists ---
tasksRoutes.get("/lists", (req, res, next) => {
  void listListsController(req, res).catch(next);
});

tasksRoutes.post("/lists", (req, res, next) => {
  void createListController(req, res).catch(next);
});

tasksRoutes.delete("/lists/:id", (req, res, next) => {
  void deleteListController(req, res).catch(next);
});

// --- Tasks ---
tasksRoutes.get("/", (req, res, next) => {
  void listTasksController(req, res).catch(next);
});

tasksRoutes.get("/:id", (req, res, next) => {
  void getTaskController(req, res).catch(next);
});

tasksRoutes.post("/", (req, res, next) => {
  void createTaskController(req, res).catch(next);
});

tasksRoutes.put("/:id", (req, res, next) => {
  void updateTaskController(req, res).catch(next);
});

tasksRoutes.delete("/:id", (req, res, next) => {
  void deleteTaskController(req, res).catch(next);
});
