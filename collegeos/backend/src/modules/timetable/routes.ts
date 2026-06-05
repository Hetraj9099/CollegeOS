import { Router } from "express";
import { listTimetableController } from "./controller.js";

export const timetableRoutes = Router();

timetableRoutes.get("/", listTimetableController);
