import { parse, serialize } from "cookie";
import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";

const SESSION_COOKIE_NAME = "collegeos_session";

type SessionPayload = {
  sub: string;
};

export function createSessionToken(userId: string) {
  return jwt.sign({ sub: userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"]
  });
}

export function verifySessionToken(token: string) {
  return jwt.verify(token, env.JWT_SECRET) as SessionPayload;
}

export function readSessionToken(cookieHeader: string | undefined) {
  if (!cookieHeader) {
    return null;
  }

  const cookies = parse(cookieHeader);
  return cookies[SESSION_COOKIE_NAME] ?? null;
}

export function buildSessionCookie(token: string) {
  return serialize(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });
}

export function buildClearedSessionCookie() {
  return serialize(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0)
  });
}
