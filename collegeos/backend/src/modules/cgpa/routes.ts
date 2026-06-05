import { Router } from "express";
import { getCgpaController } from "./controller.js";

export const cgpaRoutes = Router();

cgpaRoutes.get("/", getCgpaController);
