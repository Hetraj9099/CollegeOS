import { Router } from "express";
import { getAnalyticsController } from "./controller.js";

export const analyticsRoutes = Router();

analyticsRoutes.get("/", (req, res, next) => {
  void getAnalyticsController(req, res).catch(next);
});
