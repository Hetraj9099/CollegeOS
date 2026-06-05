import { Router } from "express";
import { listStudyController } from "./controller.js";

export const studyRoutes = Router();

studyRoutes.get("/", listStudyController);
