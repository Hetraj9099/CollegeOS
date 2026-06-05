import type { Request, Response } from "express";
import { AuthService } from "./service.js";

const service = new AuthService();

export function loginController(_req: Request, res: Response) {
  void service;
  res.status(200).json({ message: "auth placeholder" });
}
