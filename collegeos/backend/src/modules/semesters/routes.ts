import { Router } from "express";
import { listSemestersController } from "./controller.js";

export const semestersRoutes = Router();

semestersRoutes.get("/", listSemestersController);
