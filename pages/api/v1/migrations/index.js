import migrationRunner from "node-pg-migrate";
import path from "node:path";
import database from "infra/database";

export default async function migrations(request, response) {
  const allowedMethods = ["GET", "POST"];
  if (!allowedMethods.includes(request.method)) {
    return response.status(405).json({
      error: `Method ${request.method} not allowed`,
      actions: [`Use allowed method as ${allowedMethods.join(", ")}`],
    });
  }

  let dbClient;

  try {
    dbClient = await database.getConnectedClient();

    const defaultMigrationOptions = {
      dbClient: dbClient,
      dryRun: true,
      dir: path.resolve("infra", "migrations"),
      verbose: true,
      migrationsTable: "pgmigrations",
      direction: "up",
    };

    if (request.method === "GET") {
      return await handleGet(request, response, defaultMigrationOptions);
    }

    if (request.method === "POST") {
      return await handlePost(request, response, defaultMigrationOptions);
    }
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    dbClient?.end();
  }
}

async function handleGet(request, response, defaultMigrationOptions) {
  const pendingMigrations = await migrationRunner(defaultMigrationOptions);

  return response.status(200).json(pendingMigrations);
}

async function handlePost(request, response, defaultMigrationOptions) {
  const migratedMigrations = await migrationRunner({
    ...defaultMigrationOptions,
    dryRun: false,
  });

  if (migratedMigrations.length > 0) {
    return response.status(201).json(migratedMigrations);
  }

  return response.status(200).json(migratedMigrations);
}
