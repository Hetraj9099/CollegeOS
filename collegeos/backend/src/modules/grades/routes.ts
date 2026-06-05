import { Router } from "express";
import {
  listComponentsController,
  createComponentController,
  updateComponentController,
  deleteComponentController,
  recordGradeController,
  getSubjectSummaryController
} from "./controller.js";

export const gradesRoutes = Router();

gradesRoutes.get("/components", (req, res, next) => {
  void listComponentsController(req, res).catch(next);
});

gradesRoutes.post("/components", (req, res, next) => {
  void createComponentController(req, res).catch(next);
});

gradesRoutes.put("/components/:id", (req, res, next) => {
  void updateComponentController(req, res).catch(next);
});

gradesRoutes.delete("/components/:id", (req, res, next) => {
  void deleteComponentController(req, res).catch(next);
});

gradesRoutes.post("/record", (req, res, next) => {
  void recordGradeController(req, res).catch(next);
});

gradesRoutes.get("/subject/:subjectId", (req, res, next) => {
  void getSubjectSummaryController(req, res).catch(next);
});
