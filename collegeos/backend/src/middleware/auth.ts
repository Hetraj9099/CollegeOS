import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

type TokenPayload = {
  sub: string;
};

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader?.startsWith("Bearer ")) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const token = authorizationHeader.replace("Bearer ", "");

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
    req.userId = payload.sub;
    next();
  } catch {
    res.status(401).json({ message: "Unauthorized" });
  }
}
