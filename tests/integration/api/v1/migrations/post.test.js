import database from "infra/database.js";

async function cleanDatabase() {
  await database.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public");
}

beforeEach(cleanDatabase);

test("POST to /api/v1/migrations should return a non-empty array", async () => {
  // first live run
  const response = await fetch("http://localhost:3000/api/v1/migrations", {
    method: "POST",
  });

  const responseBody = await response.json();

  expect(responseBody).toBeArray();
  expect(responseBody.length).toBeGreaterThan(0);
});

test("POST to /api/v1/migrations should return a non-empty array on first live run and a empty array on second", async () => {
  {
    // first live run
    const response = await fetch("http://localhost:3000/api/v1/migrations", {
      method: "POST",
    });

    expect(response.status).toBe(201);

    const responseBody = await response.json();

    expect(responseBody).toBeArray();
    expect(responseBody.length).toBeGreaterThan(0);
  }

  {
    // first live run
    const response = await fetch("http://localhost:3000/api/v1/migrations", {
      method: "POST",
    });

    expect(response.status).toBe(200);

    const responseBody = await response.json();

    expect(responseBody).toBeArray();
    expect(responseBody.length).toBe(0);
  }
});
