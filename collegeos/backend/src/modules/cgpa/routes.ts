import { Router } from "express";
import { getCgpaController, setCgpaGoalController } from "./controller.js";

export const cgpaRoutes = Router();

cgpaRoutes.get("/", (req, res, next) => {
  void getCgpaController(req, res).catch(next);
});

cgpaRoutes.post("/", (req, res, next) => {
  void setCgpaGoalController(req, res).catch(next);
});
