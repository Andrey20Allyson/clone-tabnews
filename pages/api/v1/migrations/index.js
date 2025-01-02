import migrationRunner from "node-pg-migrate";
import path from "node:path";
import database from "infra/database";

export default async function migrations(request, response) {
  const allowedMethods = ["GET", "POST"];
  if (!allowedMethods.includes(request.method)) {
    return response.status(405).json({
      error: `Method "${request.method} not allowed"`,
      actions: [`Use allowed method as ${allowedMethods.join(", ")}`],
    });
  }

  let dbClient;

  try {
    dbClient = await database.getConnectedClient();

    const defaultMigrationOptions = {
      dbClient: dbClient,
      dryRun: true,
      dir: path.join("infra", "migrations"),
      verbose: true,
      migrationsTable: "pgmigrations",
      direction: "up",
    };

    if (request.method === "GET") {
      const pendingMigrations = await migrationRunner(defaultMigrationOptions);

      return response.status(200).json(pendingMigrations);
    }

    if (request.method === "POST") {
      const migratedMigrations = await migrationRunner({
        ...defaultMigrationOptions,
        dryRun: false,
      });

      if (migratedMigrations.length > 0) {
        return response.status(201).json(migratedMigrations);
      }

      return response.status(200).json(migratedMigrations);
    }
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    dbClient?.end();
  }
}
