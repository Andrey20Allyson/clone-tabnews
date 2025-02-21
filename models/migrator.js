import database from "infra/database";
import pgMigrationRunner from "node-pg-migrate";
import path from "node:path";

const defaultMigratorConfig = {
  dir: path.resolve("infra", "migrations"),
  log: () => {},
  migrationsTable: "pgmigrations",
  direction: "up",
};

async function listPendingMigrations() {
  let dbClient;

  try {
    dbClient = await database.getConnectedClient();

    const migrationResult = await pgMigrationRunner({
      ...defaultMigratorConfig,
      dryRun: true,
      dbClient,
    });

    return migrationResult;
  } finally {
    await dbClient?.end();
  }
}

async function runPendingMigrations() {
  let dbClient;

  try {
    dbClient = await database.getConnectedClient();

    const migrationResult = await pgMigrationRunner({
      ...defaultMigratorConfig,
      dryRun: false,
      dbClient,
    });

    return migrationResult;
  } finally {
    await dbClient?.end();
  }
}

const migrator = {
  listPendingMigrations,
  runPendingMigrations,
};

export default migrator;
