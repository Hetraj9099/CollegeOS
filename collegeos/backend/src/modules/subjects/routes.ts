import { Router } from "express";
import {
  listSubjectsController,
  getSubjectController,
  createSubjectController,
  updateSubjectController,
  deleteSubjectController
} from "./controller.js";

export const subjectsRoutes = Router();

subjectsRoutes.get("/", (req, res, next) => {
  void listSubjectsController(req, res).catch(next);
});

subjectsRoutes.get("/:id", (req, res, next) => {
  void getSubjectController(req, res).catch(next);
});

subjectsRoutes.post("/", (req, res, next) => {
  void createSubjectController(req, res).catch(next);
});

subjectsRoutes.put("/:id", (req, res, next) => {
  void updateSubjectController(req, res).catch(next);
});

subjectsRoutes.delete("/:id", (req, res, next) => {
  void deleteSubjectController(req, res).catch(next);
});
