import database from "infra/database.js";

async function cleanDatabase() {
  await database.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public");
}

beforeAll(cleanDatabase);

test("GET to /api/v1/migrations should return 200", async () => {
  const response = await fetch("http://localhost:3000/api/v1/migrations");

  // response assertions
  expect(response.status).toBe(200);

  const responseBody = await response.json();

  expect(responseBody).toBeArray();
  expect(responseBody.length).toBeGreaterThan(0);
});