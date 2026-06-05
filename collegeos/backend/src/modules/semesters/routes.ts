import { Router } from "express";
import {
  listSemestersController,
  getSemesterController,
  createSemesterController,
  updateSemesterController,
  deleteSemesterController
} from "./controller.js";

export const semestersRoutes = Router();

semestersRoutes.get("/", (req, res, next) => {
  void listSemestersController(req, res).catch(next);
});

semestersRoutes.get("/:id", (req, res, next) => {
  void getSemesterController(req, res).catch(next);
});

semestersRoutes.post("/", (req, res, next) => {
  void createSemesterController(req, res).catch(next);
});

semestersRoutes.put("/:id", (req, res, next) => {
  void updateSemesterController(req, res).catch(next);
});

semestersRoutes.delete("/:id", (req, res, next) => {
  void deleteSemesterController(req, res).catch(next);
});
