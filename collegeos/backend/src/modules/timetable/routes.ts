import { Router } from "express";
import {
  listEntriesController,
  getEntryController,
  createEntryController,
  updateEntryController,
  deleteEntryController
} from "./controller.js";

export const timetableRoutes = Router();

timetableRoutes.get("/", (req, res, next) => {
  void listEntriesController(req, res).catch(next);
});

timetableRoutes.get("/:id", (req, res, next) => {
  void getEntryController(req, res).catch(next);
});

timetableRoutes.post("/", (req, res, next) => {
  void createEntryController(req, res).catch(next);
});

timetableRoutes.put("/:id", (req, res, next) => {
  void updateEntryController(req, res).catch(next);
});

timetableRoutes.delete("/:id", (req, res, next) => {
  void deleteEntryController(req, res).catch(next);
});
