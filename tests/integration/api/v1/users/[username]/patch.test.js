import orchestrator from "tests/orchestrator";
import { version as uuidVersion } from "uuid";
import password from "models/password";
import user from "models/user";

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
      const response1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "username_one",
          email: "one@email.com",
          password: "senha123",
        }),
      });

      expect(response1.status).toBe(201);

      const response2 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "username_two",
          email: "two@email.com",
          password: "senha123",
        }),
      });

      expect(response2.status).toBe(201);

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
      const response1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "username_one",
          email: "one@email.com",
          password: "senha123",
        }),
      });

      expect(response1.status).toBe(201);

      const response2 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "username_two",
          email: "two@email.com",
          password: "senha123",
        }),
      });

      expect(response2.status).toBe(201);

      const patchResponse = await fetch(
        "http://localhost:3000/api/v1/users/username_two",
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
      const response2 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "old_username",
          email: "email@email.com",
          password: "senha123",
        }),
      });

      expect(response2.status).toBe(201);

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
        id: patchResponseBody.id,
        username: "old_username",
        email: "email@email.com",
        password: patchResponseBody.password,
        created_at: patchResponseBody.created_at,
        updated_at: patchResponseBody.updated_at,
      });
    });

    test("With unique 'username'", async () => {
      // first live run
      const response1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "username_one",
          email: "one@email.com",
          password: "senha123",
        }),
      });

      expect(response1.status).toBe(201);

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
        id: patchResponseBody.id,
        username: "username_two",
        email: "one@email.com",
        password: patchResponseBody.password,
        created_at: patchResponseBody.created_at,
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
      const response1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "username_one",
          email: "one@email.com",
          password: "senha123",
        }),
      });

      expect(response1.status).toBe(201);

      const patchResponse = await fetch(
        "http://localhost:3000/api/v1/users/username_one",
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
        id: patchResponseBody.id,
        username: "username_one",
        email: "two@email.com",
        password: patchResponseBody.password,
        created_at: patchResponseBody.created_at,
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
      const response1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "username_one",
          email: "one@email.com",
          password: "password_one",
        }),
      });

      expect(response1.status).toBe(201);

      const patchResponse = await fetch(
        "http://localhost:3000/api/v1/users/username_one",
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
        id: patchResponseBody.id,
        username: "username_one",
        email: "one@email.com",
        password: patchResponseBody.password,
        created_at: patchResponseBody.created_at,
        updated_at: patchResponseBody.updated_at,
      });

      expect(uuidVersion(patchResponseBody.id)).toBe(4);

      const createdAtTimestamp = Date.parse(patchResponseBody.created_at);
      const updatedAtTimestamp = Date.parse(patchResponseBody.updated_at);

      expect(createdAtTimestamp).not.toBeNaN();
      expect(updatedAtTimestamp).not.toBeNaN();

      expect(updatedAtTimestamp).toBeGreaterThan(createdAtTimestamp);

      const userInDatabase = await user.findOneByUsername("username_one");
      const isCorrectPasswordMatching = await password.compare(
        "password_two",
        userInDatabase.password,
      );

      expect(isCorrectPasswordMatching).toBe(true);

      const isIncorrectPasswordMatching = await password.compare(
        "password_one",
        userInDatabase.password,
      );

      expect(isIncorrectPasswordMatching).toBe(false);
    });
  });
});
