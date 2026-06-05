import type { Request, Response } from "express";
import { AuthService } from "./service.js";
import { loginSchema } from "./validator.js";

const service = new AuthService();

export async function loginController(req: Request, res: Response) {
  const parseResult = loginSchema.safeParse(req.body);

  if (!parseResult.success) {
    res.status(400).json({ message: "Invalid login payload" });
    return;
  }

  const session = await service.login(parseResult.data.password);

  if (!session) {
    res.status(401).json({ message: "Invalid password" });
    return;
  }

  res.status(200).json(session);
}

export function getSessionController(req: Request, res: Response) {
  res.status(200).json({ authenticated: true, userId: req.userId ?? null });
}
