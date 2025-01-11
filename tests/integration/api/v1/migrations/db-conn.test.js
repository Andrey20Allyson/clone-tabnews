import database from "infra/database";

async function cleanDatabase() {
  await database.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public");
}

beforeAll(cleanDatabase);

describe("/api/v1/migrations", () => {
  describe("Anonymous User", () => {
    test("Requesting every method, allawed or not", async () => {
      const methods = [
        "GET",
        "POST",
        "HEAD",
        "PUT",
        "DELETE",
        "OPTIONS",
        "PATCH",
      ];

      for (const method of methods) {
        await fetch("http://localhost:3000/api/v1/migrations", {
          method,
        });

        const statusResponse = await fetch(
          "http://localhost:3000/api/v1/status",
        );

        expect(statusResponse.status).toBe(200);

        const statusBody = await statusResponse.json();

        const databaseService = statusBody.services.find(
          (service) => service.service_name === "database",
        );

        expect(databaseService).toBeDefined();

        expect(databaseService.database_opened_connections).toBe(1);
      }
    });
  });
});
