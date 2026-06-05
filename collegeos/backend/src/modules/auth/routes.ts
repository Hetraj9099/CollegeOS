import { Router } from "express";
import { loginController } from "./controller.js";

export const authRoutes = Router();

authRoutes.get("/", loginController);
