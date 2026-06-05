import { Router } from "express";
import {
  getActiveSessionController,
  startSessionController,
  stopSessionController,
  listSessionsController,
  createSessionController,
  deleteSessionController,
  getStreakSummaryController
} from "./controller.js";

export const studyRoutes = Router();

studyRoutes.get("/active", (req, res, next) => {
  void getActiveSessionController(req, res).catch(next);
});

studyRoutes.post("/start", (req, res, next) => {
  void startSessionController(req, res).catch(next);
});

studyRoutes.post("/stop", (req, res, next) => {
  void stopSessionController(req, res).catch(next);
});

studyRoutes.get("/logs", (req, res, next) => {
  void listSessionsController(req, res).catch(next);
});

studyRoutes.post("/logs", (req, res, next) => {
  void createSessionController(req, res).catch(next);
});

studyRoutes.delete("/logs/:id", (req, res, next) => {
  void deleteSessionController(req, res).catch(next);
});

studyRoutes.get("/streak", (req, res, next) => {
  void getStreakSummaryController(req, res).catch(next);
});
