import { Router } from "express";
import { listCalendarController } from "./controller.js";

export const calendarRoutes = Router();

calendarRoutes.get("/", listCalendarController);
