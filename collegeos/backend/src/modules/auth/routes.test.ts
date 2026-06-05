import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { createApp } from "../../app.js";
import { AuthRepository } from "./repository.js";
import { hashPassword } from "../../utils/password.js";

test("GET /api/auth/status reports setup is required when no user exists", async () => {
  const originalCountUsers = AuthRepository.prototype.countUsers;

  AuthRepository.prototype.countUsers = async () => 0;

  try {
    const response = await request(createApp()).get("/api/auth/status");

    assert.equal(response.status, 200);
    assert.deepEqual(response.body, {
      hasUser: false,
      authenticated: false
    });
  } finally {
    AuthRepository.prototype.countUsers = originalCountUsers;
  }
});

test("POST /api/auth/setup creates the first user and returns an authenticated session cookie", async () => {
  const originalCountUsers = AuthRepository.prototype.countUsers;
  const originalCreateUser = AuthRepository.prototype.createUser;

  AuthRepository.prototype.countUsers = async () => 0;
  AuthRepository.prototype.createUser = async () => ({ id: "user-1" });

  try {
    const response = await request(createApp()).post("/api/auth/setup").send({
      password: "Hetraj_8520"
    });

    assert.equal(response.status, 201);
    assert.equal(response.body.hasUser, true);
    assert.equal(response.body.authenticated, true);
    assert.equal(Array.isArray(response.headers["set-cookie"]), true);
  } finally {
    AuthRepository.prototype.countUsers = originalCountUsers;
    AuthRepository.prototype.createUser = originalCreateUser;
  }
});

test("POST /api/auth/unlock accepts the configured password and sets a session cookie", async () => {
  const originalFindPrimaryUser = AuthRepository.prototype.findPrimaryUser;
  const passwordHash = await hashPassword("Hetraj_8520");

  AuthRepository.prototype.findPrimaryUser = async () => ({
    id: "user-1",
    password_hash: passwordHash
  });

  try {
    const response = await request(createApp()).post("/api/auth/unlock").send({
      password: "Hetraj_8520"
    });

    assert.equal(response.status, 200);
    assert.equal(response.body.authenticated, true);
    assert.equal(Array.isArray(response.headers["set-cookie"]), true);
  } finally {
    AuthRepository.prototype.findPrimaryUser = originalFindPrimaryUser;
  }
});
