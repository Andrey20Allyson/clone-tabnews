import orchestrator from "tests/orchestrator";
import { version as uuidVersion } from "uuid";

beforeEach(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/users/[username]", () => {
  describe("Anonymous User", () => {
    test("With exact case match", async () => {
      const response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "SameCase",
          email: "samecase@mail.com",
          password: "senha123",
        }),
      });

      expect(response.status).toBe(201);

      const getUserResponse = await fetch(
        "http://localhost:3000/api/v1/users/SameCase",
      );

      expect(getUserResponse.status).toBe(200);

      const responseBody = await getUserResponse.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "SameCase",
        email: "samecase@mail.com",
        password: "senha123",
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
    });

    test("With case missmatch", async () => {
      const response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "DifferentCase",
          email: "different.case@mail.com",
          password: "senha123",
        }),
      });

      expect(response.status).toBe(201);

      const getUserResponse = await fetch(
        "http://localhost:3000/api/v1/users/differentcase",
      );

      expect(getUserResponse.status).toBe(200);

      const responseBody = await getUserResponse.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "DifferentCase",
        email: "different.case@mail.com",
        password: "senha123",
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
    });

    test("With nonexistent username", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/InexistentUser",
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
  });
});
