import type { NextFunction, Request, Response } from "express";

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  req.userId = "dev-user-id";
  next();
}

