import type { Request, Response } from "express";
import { AuthService } from "./service.js";
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

  // If user exists and no valid token, create one automatically
  if (status.hasUser) {
    if (token) {
      try {
        verifySessionToken(token);
        authenticated = true;
      } catch {
        // Token invalid, create new one
        const user = await service.getPrimaryUser();
        if (user) {
          const newToken = createSessionToken(user.id);
          res.setHeader("Set-Cookie", buildSessionCookie(newToken));
          authenticated = true;
        }
      }
    } else {
      // No token, create one for existing user
      const user = await service.getPrimaryUser();
      if (user) {
        const newToken = createSessionToken(user.id);
        res.setHeader("Set-Cookie", buildSessionCookie(newToken));
        authenticated = true;
      }
    }
  }

  res.status(200).json({
    hasUser: status.hasUser,
    authenticated
  });
}

export async function setupController(req: Request, res: Response) {
  // Auto-setup: create a user with default password if one doesn't exist
  let user = await service.getPrimaryUser();

  if (!user) {
    // Create user with default password
    const setupResult = await service.setup("default-collegeos-user");
    if (!setupResult) {
      res.status(500).json({ message: "Failed to create user" });
      return;
    }
    user = { id: setupResult.userId, password_hash: "" };
  }

  const token = createSessionToken(user.id);
  res.setHeader("Set-Cookie", buildSessionCookie(token));
  res.status(201).json({ hasUser: true, authenticated: true });
}

export async function unlockController(req: Request, res: Response) {
  // No password verification needed - just authenticate existing user
  const user = await service.getPrimaryUser();

  if (!user) {
    res.status(401).json({ message: "No user configured" });
    return;
  }

  const token = createSessionToken(user.id);
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
