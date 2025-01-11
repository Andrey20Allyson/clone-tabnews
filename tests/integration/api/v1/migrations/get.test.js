import database from "infra/database.js";

async function cleanDatabase() {
  await database.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public");
}

beforeAll(cleanDatabase);

describe("GET /api/v1/migrations", () => {
  describe("Anonymous User", () => {
    test("Retrieving pending migrations", async () => {
      const response = await fetch("http://localhost:3000/api/v1/migrations");

      // response assertions
      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toBeArray();
      expect(responseBody.length).toBeGreaterThan(0);
    });
  });
});
