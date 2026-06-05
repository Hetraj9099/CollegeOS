import { Router } from "express";
import {
  listEventsController,
  getEventController,
  createEventController,
  updateEventController,
  deleteEventController
} from "./controller.js";

export const calendarRoutes = Router();

calendarRoutes.get("/", (req, res, next) => {
  void listEventsController(req, res).catch(next);
});

calendarRoutes.get("/:id", (req, res, next) => {
  void getEventController(req, res).catch(next);
});

calendarRoutes.post("/", (req, res, next) => {
  void createEventController(req, res).catch(next);
});

calendarRoutes.put("/:id", (req, res, next) => {
  void updateEventController(req, res).catch(next);
});

calendarRoutes.delete("/:id", (req, res, next) => {
  void deleteEventController(req, res).catch(next);
});
