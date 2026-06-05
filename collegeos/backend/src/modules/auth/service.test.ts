import test from "node:test";
import assert from "node:assert/strict";
import { AuthService } from "./service.js";
import { hashPassword } from "../../utils/password.js";

test("AuthService.getStatus reports whether a user exists", async () => {
  const serviceWithoutUser = new AuthService({
    countUsers: async () => 0,
    findPrimaryUser: async () => null,
    createUser: async () => ({ id: "unused" })
  });

  const serviceWithUser = new AuthService({
    countUsers: async () => 1,
    findPrimaryUser: async () => null,
    createUser: async () => ({ id: "unused" })
  });

  assert.deepEqual(await serviceWithoutUser.getStatus(), { hasUser: false });
  assert.deepEqual(await serviceWithUser.getStatus(), { hasUser: true });
});

test("AuthService.setup creates the single user only once", async () => {
  let createdPasswordHash: string | null = null;

  const service = new AuthService({
    countUsers: async () => (createdPasswordHash ? 1 : 0),
    findPrimaryUser: async () => null,
    createUser: async (passwordHash: string) => {
      createdPasswordHash = passwordHash;
      return { id: "user-1" };
    }
  });

  const setupResult = await service.setup("Hetraj_8520");
  const secondSetupResult = await service.setup("AnotherPassword123");

  assert.deepEqual(setupResult, { userId: "user-1" });
  assert.equal(typeof createdPasswordHash, "string");
  assert.equal(secondSetupResult, null);
});

test("AuthService.unlock verifies the master password", async () => {
  const passwordHash = await hashPassword("Hetraj_8520");
  const service = new AuthService({
    countUsers: async () => 1,
    findPrimaryUser: async () => ({ id: "user-1", password_hash: passwordHash }),
    createUser: async () => ({ id: "unused" })
  });

  assert.deepEqual(await service.unlock("Hetraj_8520"), { userId: "user-1" });
  assert.equal(await service.unlock("wrong"), null);
});
