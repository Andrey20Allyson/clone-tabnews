import database from "infra/database";
import pgMigrationRunner from "node-pg-migrate";
import path from "node:path";

async function excecuteMigrations({ dryRun = true }) {
  let dbClient;

  try {
    dbClient = await database.getConnectedClient();

    const config = {
      dbClient: dbClient,
      dryRun,
      dir: path.resolve("infra", "migrations"),
      verbose: true,
      migrationsTable: "pgmigrations",
      direction: "up",
    };

    const migrationResult = await pgMigrationRunner(config);

    return migrationResult;
  } finally {
    await dbClient?.end();
  }
}

const migrationRunner = { excecuteMigrations };

export default migrationRunner;
