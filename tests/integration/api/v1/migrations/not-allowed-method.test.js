import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.clearDatabase();
});

describe("/api/v1/migrations", () => {
  describe("Anonymous User", () => {
    test("Requesting every not allawed", async () => {
      const methods = [
        // "GET",
        // "POST",
        // "HEAD",
        "PUT",
        "DELETE",
        "OPTIONS",
        "PATCH",
      ];

      for (const method of methods) {
        const response = await fetch(
          "http://localhost:3000/api/v1/migrations",
          {
            method,
          },
        );

        expect(response.status).toBe(405);

        const responseBody = await response.json();

        expect(responseBody).toEqual({
          name: "MethodNotAllowedError",
          message: "Método não permitido para este endpoint.",
          action:
            "Verifique se o método HTTP enviado é válido para este endpoint.",
          status_code: 405,
        });
      }
    });
  });
});
