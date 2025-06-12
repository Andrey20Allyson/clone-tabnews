import { faker } from "@faker-js/faker";
import retry from "async-retry";
import database from "infra/database";
import migrator from "models/migrator";
import password from "models/password";
import user from "models/user";

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

async function runPendingMigrations() {
  await migrator.runPendingMigrations();
}

async function createUser(userObject) {
  return user.create({
    username:
      userObject?.username ?? faker.internet.username().replace(/[_.-]/g, ""),
    email: userObject?.email ?? faker.internet.email(),
    password: userObject?.password ?? "validpassword",
  });
}

async function findOneUserByUsername(username) {
  return user.findOneByUsername(username);
}

async function comparePasswords(passwordInText, hash) {
  return password.compare(passwordInText, hash);
}

const orchestrator = {
  waitForAllServices,
  clearDatabase,
  runPendingMigrations,
  createUser,
  findOneUserByUsername,
  comparePasswords,
};

export default orchestrator;
