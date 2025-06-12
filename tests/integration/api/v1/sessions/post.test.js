import orchestrator from "tests/orchestrator";

beforeEach(async () => {
  await orchestrator.waitForAllServices(), await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/sessions", () => {
  describe("Anonymous User", () => {
    test("With correct password but incorrect email", async () => {
      await orchestrator.createUser({
        password: "correct_password",
      });

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "incorrect_email@mail.com",
          password: "correct_password",
        }),
      });

      expect(response.status).toBe(401);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Dados de autorização não conferem.",
        action: "Verifique se os dados enviados estão corretos.",
        status_code: 401,
      });
    });

    test("With correct email but incorrect password", async () => {
      await orchestrator.createUser({
        email: "correct_email@mail.com",
      });

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "correct_email@mail.com",
          password: "incorrect_password",
        }),
      });

      expect(response.status).toBe(401);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Dados de autorização não conferem.",
        action: "Verifique se os dados enviados estão corretos.",
        status_code: 401,
      });
    });

    test("With incorrect email and incorrect password", async () => {
      await orchestrator.createUser();

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "incorrect_email@mail.com",
          password: "incorrect_password",
        }),
      });

      expect(response.status).toBe(401);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Dados de autorização não conferem.",
        action: "Verifique se os dados enviados estão corretos.",
        status_code: 401,
      });
    });

    test("Trying to know if the `email` exists", async () => {
      let delay = Date.now();

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "this_user_dont_exist@email.com",
          password: "incorrect_password",
          // sets a production like hash rounds
          __testRounds: 14,
        }),
      });

      expect(response.status).toBe(401);

      await response.body.cancel();

      delay = Date.now() - delay;

      const minimumDelay = 200;

      // attacker verifies if delay implies that the email exists
      expect(delay > minimumDelay).toBeTruthy();
    });
  });
});
