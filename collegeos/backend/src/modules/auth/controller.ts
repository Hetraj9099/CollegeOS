import type { Request, Response } from "express";
import { AuthService } from "./service.js";
import { setupSchema, unlockSchema } from "./validator.js";
import {
  buildClearedSessionCookie,
  buildSessionCookie,
  createSessionToken,
  readSessionToken,
  verifySessionToken
} from "../../utils/session.js";

const service = new AuthService();

export async function getAuthStatusController(req: Request, res: Response) {
  const status = await service.getStatus();
  const token = readSessionToken(req.headers.cookie);
  let authenticated = false;

  if (token) {
    try {
      verifySessionToken(token);
      authenticated = true;
    } catch {
      authenticated = false;
    }
  }

  res.status(200).json({
    hasUser: status.hasUser,
    authenticated
  });
}

export async function setupController(req: Request, res: Response) {
  const parseResult = setupSchema.safeParse(req.body);

  if (!parseResult.success) {
    res.status(400).json({ message: "Invalid setup payload" });
    return;
  }

  const result = await service.setup(parseResult.data.password);

  if (!result) {
    res.status(409).json({ message: "User is already configured" });
    return;
  }

  const token = createSessionToken(result.userId);
  res.setHeader("Set-Cookie", buildSessionCookie(token));
  res.status(201).json({ hasUser: true, authenticated: true });
}

export async function unlockController(req: Request, res: Response) {
  const parseResult = unlockSchema.safeParse(req.body);

  if (!parseResult.success) {
    res.status(400).json({ message: "Invalid unlock payload" });
    return;
  }

  const result = await service.unlock(parseResult.data.password);

  if (!result) {
    res.status(401).json({ message: "Invalid password" });
    return;
  }

  const token = createSessionToken(result.userId);
  res.setHeader("Set-Cookie", buildSessionCookie(token));
  res.status(200).json({ hasUser: true, authenticated: true });
}

export function getSessionController(req: Request, res: Response) {
  res.status(200).json({ authenticated: true, userId: req.userId ?? null });
}

export function logoutController(_req: Request, res: Response) {
  res.setHeader("Set-Cookie", buildClearedSessionCookie());
  res.status(200).json({ authenticated: false });
}
