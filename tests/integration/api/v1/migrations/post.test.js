import orchestrator from "tests/orchestrator";

beforeEach(async () => {
  await orchestrator.clearDatabase();
});

describe("POST /api/v1/migrations", () => {
  describe("Anonymous User", () => {
    test("Running pending migrations", async () => {
      // first live run
      const response = await fetch("http://localhost:3000/api/v1/migrations", {
        method: "POST",
      });

      const responseBody = await response.json();

      expect(responseBody).toBeArray();
      expect(responseBody.length).toBeGreaterThan(0);
    });

    test("Running pending migrations more than once", async () => {
      {
        // first live run
        const response = await fetch(
          "http://localhost:3000/api/v1/migrations",
          {
            method: "POST",
          },
        );

        expect(response.status).toBe(201);

        const responseBody = await response.json();

        expect(responseBody).toBeArray();
        expect(responseBody.length).toBeGreaterThan(0);
      }

      {
        // first live run
        const response = await fetch(
          "http://localhost:3000/api/v1/migrations",
          {
            method: "POST",
          },
        );

        expect(response.status).toBe(200);

        const responseBody = await response.json();

        expect(responseBody).toBeArray();
        expect(responseBody.length).toBe(0);
      }
    });
  });
});
