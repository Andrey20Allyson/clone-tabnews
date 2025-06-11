import orchestrator from "tests/orchestrator";
import { version as uuidVersion } from "uuid";

beforeEach(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("PATCH /api/v1/users/[username]", () => {
  describe("Anonymous User", () => {
    test("With nonexistent 'username'", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/InexistentUser",
        {
          method: "PATCH",
        },
      );

      expect(response.status).toBe(404);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "NotFoundError",
        message: "O username informado não foi encontrado no sistema.",
        action: "Verifique se o username está digitando corretamente.",
        status_code: 404,
      });
    });

    test("With duplicated 'username'", async () => {
      // first live run
      await orchestrator.createUser({
        username: "username_one",
      });

      await orchestrator.createUser({
        username: "username_two",
      });

      const patchResponse = await fetch(
        "http://localhost:3000/api/v1/users/username_two",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "username_one",
          }),
        },
      );

      expect(patchResponse.status).toBe(400);

      const patchResponseBody = await patchResponse.json();

      expect(patchResponseBody).toEqual({
        name: "ValidationError",
        message: "O username informado já está sendo utilizado.",
        action: "Utilize outro username para realizar esta operação.",
        status_code: 400,
      });
    });

    test("With duplicated 'email'", async () => {
      // first live run
      await orchestrator.createUser({
        email: "one@email.com",
      });

      const createdUserTwo = await orchestrator.createUser({
        email: "two@email.com",
      });

      const patchResponse = await fetch(
        `http://localhost:3000/api/v1/users/${createdUserTwo.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "one@email.com",
          }),
        },
      );

      expect(patchResponse.status).toBe(400);

      const patchResponseBody = await patchResponse.json();

      expect(patchResponseBody).toEqual({
        name: "ValidationError",
        message: "O email informado já está sendo utilizado.",
        action: "Utilize outro email para realizar esta operação.",
        status_code: 400,
      });
    });

    test("Patching to the same 'username'", async () => {
      const createdUser = await orchestrator.createUser({
        username: "old_username",
      });

      const patchResponse = await fetch(
        "http://localhost:3000/api/v1/users/old_username",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "old_username",
          }),
        },
      );

      expect(patchResponse.status).toBe(200);

      const patchResponseBody = await patchResponse.json();

      expect(patchResponseBody).toEqual({
        id: createdUser.id,
        username: "old_username",
        email: createdUser.email,
        password: createdUser.password,
        created_at: createdUser.created_at.toISOString(),
        updated_at: patchResponseBody.updated_at,
      });
    });

    test("With unique 'username'", async () => {
      // first live run
      const createdUser = await orchestrator.createUser({
        username: "username_one",
      });

      const patchResponse = await fetch(
        "http://localhost:3000/api/v1/users/username_one",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "username_two",
          }),
        },
      );

      expect(patchResponse.status).toBe(200);

      const patchResponseBody = await patchResponse.json();

      expect(patchResponseBody).toEqual({
        id: createdUser.id,
        username: "username_two",
        email: createdUser.email,
        password: createdUser.password,
        created_at: createdUser.created_at.toISOString(),
        updated_at: patchResponseBody.updated_at,
      });

      expect(uuidVersion(patchResponseBody.id)).toBe(4);

      const createdAtTimestamp = Date.parse(patchResponseBody.created_at);
      const updatedAtTimestamp = Date.parse(patchResponseBody.updated_at);

      expect(createdAtTimestamp).not.toBeNaN();
      expect(updatedAtTimestamp).not.toBeNaN();

      expect(updatedAtTimestamp).toBeGreaterThan(createdAtTimestamp);
    });

    test("With unique 'email'", async () => {
      // first live run
      const createdUser = await orchestrator.createUser({
        email: "one@email.com",
      });

      const patchResponse = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "two@email.com",
          }),
        },
      );

      expect(patchResponse.status).toBe(200);

      const patchResponseBody = await patchResponse.json();

      expect(patchResponseBody).toEqual({
        id: createdUser.id,
        username: createdUser.username,
        email: "two@email.com",
        password: createdUser.password,
        created_at: createdUser.created_at.toISOString(),
        updated_at: patchResponseBody.updated_at,
      });

      expect(uuidVersion(patchResponseBody.id)).toBe(4);

      const createdAtTimestamp = Date.parse(patchResponseBody.created_at);
      const updatedAtTimestamp = Date.parse(patchResponseBody.updated_at);

      expect(createdAtTimestamp).not.toBeNaN();
      expect(updatedAtTimestamp).not.toBeNaN();

      expect(updatedAtTimestamp).toBeGreaterThan(createdAtTimestamp);
    });

    test("With new 'password'", async () => {
      // first live run
      const createdUser = await orchestrator.createUser({
        password: "password_one",
      });

      const patchResponse = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password: "password_two",
          }),
        },
      );

      expect(patchResponse.status).toBe(200);

      const patchResponseBody = await patchResponse.json();

      expect(patchResponseBody).toEqual({
        id: createdUser.id,
        username: createdUser.username,
        email: createdUser.email,
        password: patchResponseBody.password,
        created_at: createdUser.created_at.toISOString(),
        updated_at: patchResponseBody.updated_at,
      });

      expect(uuidVersion(patchResponseBody.id)).toBe(4);

      const createdAtTimestamp = Date.parse(patchResponseBody.created_at);
      const updatedAtTimestamp = Date.parse(patchResponseBody.updated_at);

      expect(createdAtTimestamp).not.toBeNaN();
      expect(updatedAtTimestamp).not.toBeNaN();

      expect(updatedAtTimestamp).toBeGreaterThan(createdAtTimestamp);

      const userInDatabase = await orchestrator.findOneUserByUsername(
        createdUser.username,
      );
      const isCorrectPasswordMatching = await orchestrator.comparePasswords(
        "password_two",
        userInDatabase.password,
      );

      expect(isCorrectPasswordMatching).toBe(true);

      const isIncorrectPasswordMatching = await orchestrator.comparePasswords(
        "password_one",
        userInDatabase.password,
      );

      expect(isIncorrectPasswordMatching).toBe(false);
    });
  });
});
