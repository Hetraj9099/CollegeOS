import test from "node:test";
import assert from "node:assert/strict";
import { hashPassword, verifyPassword } from "./password.js";

test("hashPassword creates a bcrypt hash that verifies successfully", async () => {
  const password = "CorrectHorseBatteryStaple123";
  const hash = await hashPassword(password);

  assert.notEqual(hash, password);
  assert.equal(await verifyPassword(password, hash), true);
  assert.equal(await verifyPassword("wrong-password", hash), false);
});
