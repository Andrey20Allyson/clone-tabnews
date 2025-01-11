import retry from "async-retry";
import database from "infra/database";

async function waitForAllServices() {
  await waitForWebServer();
}

function waitForWebServer() {
  return retry(fetchStatusPage, {
    retries: 100,
    factor: 1.1,
    minTimeout: 100,
    maxTimeout: 5000,
  });
}

async function fetchStatusPage() {
  const response = await fetch("http://localhost:3000/api/v1/status");

  if (response.status !== 200) {
    return Promise.reject(
      new Error("GET /api/v1/status don't is returning 200"),
    );
  }
}

async function clearDatabase() {
  await database.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public");
}

const orchestrator = {
  waitForAllServices,
  clearDatabase,
};

export default orchestrator;
