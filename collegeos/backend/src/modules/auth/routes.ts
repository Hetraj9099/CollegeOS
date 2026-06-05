import { Router } from "express";
import { getSessionController, loginController } from "./controller.js";
import { authMiddleware } from "../../middleware/auth.js";

export const authRoutes = Router();

authRoutes.post("/login", (req, res, next) => {
  void loginController(req, res).catch(next);
});
authRoutes.get("/session", authMiddleware, getSessionController);
