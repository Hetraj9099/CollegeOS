import { Router } from "express";
import {
  getAuthStatusController,
  getSessionController,
  logoutController,
  setupController,
  unlockController
} from "./controller.js";
import { authMiddleware } from "../../middleware/auth.js";

export const authRoutes = Router();

authRoutes.get("/status", (req, res, next) => {
  void getAuthStatusController(req, res).catch(next);
});
authRoutes.post("/setup", (req, res, next) => {
  void setupController(req, res).catch(next);
});
authRoutes.post("/unlock", (req, res, next) => {
  void unlockController(req, res).catch(next);
});
authRoutes.get("/session", authMiddleware, getSessionController);
authRoutes.post("/logout", logoutController);
