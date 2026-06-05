import { Router } from "express";
import { getAnalyticsController } from "./controller.js";

export const analyticsRoutes = Router();

analyticsRoutes.get("/", getAnalyticsController);
