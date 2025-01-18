import { createRouter } from "next-connect";
import { onErrorHandler, onNoMatchHandler } from "infra/generic-handlers";
import migrationRunner from "infra/migration-runner";

const router = createRouter();

router.get(getHandler);

router.post(postHandler);

export default router.handler({
  onNoMatch: onNoMatchHandler,
  onError: onErrorHandler,
});

async function getHandler(request, response) {
  const pendingMigrations = await migrationRunner.excecuteMigrations({
    dryRun: true,
  });

  return response.status(200).json(pendingMigrations);
}

async function postHandler(request, response) {
  const migratedMigrations = await migrationRunner.excecuteMigrations({
    dryRun: false,
  });

  if (migratedMigrations.length > 0) {
    return response.status(201).json(migratedMigrations);
  }

  return response.status(200).json(migratedMigrations);
}
