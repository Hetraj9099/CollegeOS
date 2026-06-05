import { Router } from "express";
import { listGradesController } from "./controller.js";

export const gradesRoutes = Router();

gradesRoutes.get("/", listGradesController);
