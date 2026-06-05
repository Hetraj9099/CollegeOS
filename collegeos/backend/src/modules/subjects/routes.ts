import { Router } from "express";
import { listSubjectsController } from "./controller.js";

export const subjectsRoutes = Router();

subjectsRoutes.get("/", listSubjectsController);
